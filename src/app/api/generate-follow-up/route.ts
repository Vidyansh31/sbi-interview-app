import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MAX_QUESTION_LENGTH = 1000;
const MAX_ANSWER_LENGTH = 5000;
const MAX_CONTEXT_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 6; // Max 3 turns (question + answer)

interface ConversationTurnInput {
  question: string;
  answer: string;
}

interface FollowUpDecisionResponse {
  shouldAskFollowUp: boolean;
  followUpQuestion: string | null;
}

/**
 * Strips markdown code blocks (```json ... ``` or ``` ...) and whitespace
 */
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
  }
  return text.trim();
}

/**
 * Validates that an unknown object conforms strictly to FollowUpDecisionResponse
 */
function validateFollowUpDecision(obj: unknown): { valid: true; data: FollowUpDecisionResponse } | { valid: false; reason: string } {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { valid: false, reason: "Response is not a valid JSON object" };
  }

  const record = obj as Record<string, unknown>;

  // shouldAskFollowUp: must be boolean
  if (typeof record.shouldAskFollowUp !== "boolean") {
    return { valid: false, reason: "Missing or invalid boolean 'shouldAskFollowUp'" };
  }

  // If true: followUpQuestion must be a non-empty string between 10 and 500 chars
  if (record.shouldAskFollowUp) {
    if (
      typeof record.followUpQuestion !== "string" ||
      !record.followUpQuestion.trim()
    ) {
      return { valid: false, reason: "shouldAskFollowUp is true but followUpQuestion is missing or empty" };
    }

    const trimmed = record.followUpQuestion.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      return { valid: false, reason: "followUpQuestion length is out of acceptable bounds (10-500 chars)" };
    }

    return {
      valid: true,
      data: {
        shouldAskFollowUp: true,
        followUpQuestion: trimmed,
      },
    };
  }

  // If false: followUpQuestion should be null (or ignored/empty)
  return {
    valid: true,
    data: {
      shouldAskFollowUp: false,
      followUpQuestion: null,
    },
  };
}

/**
 * Parses and validates raw text output from Gemini into FollowUpDecisionResponse
 */
function parseAndValidate(rawText: string | undefined): { success: true; data: FollowUpDecisionResponse } | { success: false; reason: string } {
  if (!rawText || !rawText.trim()) {
    return { success: false, reason: "Gemini returned an empty text response" };
  }

  const cleaned = cleanJsonText(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    return { success: false, reason: `JSON parse error: ${err instanceof Error ? err.message : String(err)}` };
  }

  const validation = validateFollowUpDecision(parsed);
  if (!validation.valid) {
    return { success: false, reason: validation.reason };
  }

  return { success: true, data: validation.data };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body?.question;
    const answer = body?.answer;
    const evaluationSummary = body?.evaluationSummary;
    const currentFollowUpCount = typeof body?.currentFollowUpCount === "number" ? body.currentFollowUpCount : 0;
    const conversationHistory: ConversationTurnInput[] = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory.slice(-MAX_HISTORY_ITEMS)
      : [];

    // Validate required fields
    if (
      typeof question !== "string" ||
      typeof answer !== "string" ||
      !question.trim() ||
      !answer.trim()
    ) {
      return NextResponse.json(
        { error: "A question and answer are required." },
        { status: 400 }
      );
    }

    // Validate length limits
    if (question.length > MAX_QUESTION_LENGTH || answer.length > MAX_ANSWER_LENGTH) {
      return NextResponse.json(
        { error: "The question or answer exceeds maximum length limits." },
        { status: 400 }
      );
    }

    if (
      evaluationSummary !== undefined &&
      (typeof evaluationSummary !== "string" || evaluationSummary.length > MAX_CONTEXT_LENGTH)
    ) {
      return NextResponse.json(
        { error: "The evaluation summary is invalid or exceeds maximum length limits." },
        { status: 400 }
      );
    }

    // If already at or above maximum 3 follow-ups, immediately return decision false
    if (currentFollowUpCount >= 3) {
      return NextResponse.json({
        success: true,
        shouldAskFollowUp: false,
        followUpQuestion: null,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for context
    let formattedHistory = "";
    if (conversationHistory.length > 0) {
      formattedHistory = "\nPRIOR DIALOGUE ON THIS MAIN TOPIC:\n" + conversationHistory.map((item, idx) => {
        const qSafe = typeof item.question === "string" ? item.question.slice(0, 500) : "";
        const aSafe = typeof item.answer === "string" ? item.answer.slice(0, 1000) : "";
        return `[Turn ${idx + 1}] Panel: ${qSafe}\nCandidate: ${aSafe}`;
      }).join("\n\n") + "\n";
    }

    const contextSection = evaluationSummary?.trim()
      ? `\nEVALUATION OF LATEST ANSWER:\n${evaluationSummary.trim()}\n`
      : "";

    const remainingAllowed = 3 - currentFollowUpCount;

    const primaryPrompt = `You are an expert, observant State Bank of India (SBI) Probationary Officer interview board panelist.

You are evaluating whether to ask an adaptive follow-up question or conclude this topic and move to the next interview question.
Follow-ups already asked for this topic: ${currentFollowUpCount} (Maximum allowed: 3, remaining permitted: ${remainingAllowed}).

LATEST QUESTION ASKED:
${question.trim()}

CANDIDATE'S LATEST ANSWER:
${answer.trim()}
${contextSection}${formattedHistory}
DECISION RULES:
1. DECIDE "shouldAskFollowUp": true ONLY IF the candidate made a specific claim, showed a notable knowledge gap, gave an intriguing perspective, or left an important ambiguity that a rigorous SBI PO interview board would naturally probe deeper.
2. DECIDE "shouldAskFollowUp": false IF the candidate's answer was thorough and complete, or if further questioning on this topic would be repetitive, nitpicking, or unhelpful.
3. If "shouldAskFollowUp" is true:
   - Provide "followUpQuestion": exactly ONE focused, professional, realistic question probing their reasoning, banking knowledge, or practical judgment.
   - Do NOT ask generic questions (e.g., do NOT ask "Can you elaborate?" or "Why do you feel this way?").
   - Do NOT repeat points already clarified in the prior dialogue.
   - Do NOT invent candidate details or credentials.
4. If "shouldAskFollowUp" is false:
   - Provide "followUpQuestion": null.

CRITICAL FORMATTING INSTRUCTIONS:
- You must respond with ONLY a single valid JSON object.
- Do NOT include Markdown formatting, code fences (like \`\`\`json), or commentary.
- Your output must strictly match this JSON schema:
{
  "shouldAskFollowUp": true,
  "followUpQuestion": "<string: specific follow-up question>"
}
OR
{
  "shouldAskFollowUp": false,
  "followUpQuestion": null
}`;

    // First attempt
    const firstResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: primaryPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let result = parseAndValidate(firstResponse.text);

    // If first attempt failed validation, retry once with a strict schema prompt
    if (!result.success) {
      console.warn(
        "First Gemini follow-up decision attempt failed validation:",
        result.reason,
        "- Retrying once with stricter prompt."
      );

      const retryPrompt = `You are an automated interview decision engine.
Analyze this interview exchange and return ONLY valid, parseable JSON conforming strictly to the schema below.

QUESTION:
${question.trim()}

CANDIDATE ANSWER:
${answer.trim()}

SCHEMA REQUIRED:
{
  "shouldAskFollowUp": boolean,
  "followUpQuestion": "string or null"
}

If shouldAskFollowUp is true, followUpQuestion must be a non-empty string.
If shouldAskFollowUp is false, followUpQuestion must be null.
Output MUST be raw JSON without markdown code blocks.`;

      const retryResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: retryPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      result = parseAndValidate(retryResponse.text);

      if (!result.success) {
        console.error("Gemini follow-up decision retry also failed validation. Diagnostic details:", {
          reason: result.reason,
          rawResponseLength: retryResponse.text ? retryResponse.text.length : 0,
        });

        return NextResponse.json(
          { error: "Unable to decide on follow-up question due to an unexpected format from the evaluator. Please try again." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      shouldAskFollowUp: result.data.shouldAskFollowUp,
      followUpQuestion: result.data.followUpQuestion,
    });
  } catch (error) {
    console.error(
      "Follow-up question decision failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "Unable to generate follow-up question. Please try again." },
      { status: 502 }
    );
  }
}
