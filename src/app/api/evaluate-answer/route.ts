import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MAX_ANSWER_LENGTH = 5000;

interface FeedbackStructure {
  score: number;
  relevance: string;
  bankingKnowledge: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
  followUpQuestion: string;
}

/**
 * Strips markdown code blocks (```json ... ``` or ``` ...) and whitespace
 */
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith("```")) {
    // Remove opening fence (e.g. ```json or ```)
    text = text.replace(/^```(?:json)?\s*/i, "");
    // Remove closing fence
    text = text.replace(/\s*```$/, "");
  }
  return text.trim();
}

/**
 * Validates that an unknown object conforms strictly to FeedbackStructure
 */
function validateFeedback(obj: unknown): { valid: true; feedback: FeedbackStructure } | { valid: false; reason: string } {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { valid: false, reason: "Response is not a valid JSON object" };
  }

  const record = obj as Record<string, unknown>;

  // 1. score: integer from 1 to 10
  if (
    typeof record.score !== "number" ||
    !Number.isInteger(record.score) ||
    record.score < 1 ||
    record.score > 10
  ) {
    return { valid: false, reason: `Invalid 'score': expected integer between 1 and 10, got ${JSON.stringify(record.score)}` };
  }

  // 2. relevance: string
  if (typeof record.relevance !== "string" || !record.relevance.trim()) {
    return { valid: false, reason: "Invalid or empty 'relevance' string" };
  }

  // 3. bankingKnowledge: string
  if (typeof record.bankingKnowledge !== "string" || !record.bankingKnowledge.trim()) {
    return { valid: false, reason: "Invalid or empty 'bankingKnowledge' string" };
  }

  // 4. strengths: array of strings
  if (
    !Array.isArray(record.strengths) ||
    record.strengths.length === 0 ||
    !record.strengths.every((item) => typeof item === "string" && item.trim())
  ) {
    return { valid: false, reason: "Invalid 'strengths': expected non-empty array of strings" };
  }

  // 5. improvements: array of strings
  if (
    !Array.isArray(record.improvements) ||
    record.improvements.length === 0 ||
    !record.improvements.every((item) => typeof item === "string" && item.trim())
  ) {
    return { valid: false, reason: "Invalid 'improvements': expected non-empty array of strings" };
  }

  // 6. suggestedAnswer: string
  if (typeof record.suggestedAnswer !== "string" || !record.suggestedAnswer.trim()) {
    return { valid: false, reason: "Invalid or empty 'suggestedAnswer' string" };
  }

  // 7. followUpQuestion: string
  if (typeof record.followUpQuestion !== "string" || !record.followUpQuestion.trim()) {
    return { valid: false, reason: "Invalid or empty 'followUpQuestion' string" };
  }

  return {
    valid: true,
    feedback: {
      score: record.score,
      relevance: record.relevance.trim(),
      bankingKnowledge: record.bankingKnowledge.trim(),
      strengths: record.strengths.map((s) => (s as string).trim()),
      improvements: record.improvements.map((s) => (s as string).trim()),
      suggestedAnswer: record.suggestedAnswer.trim(),
      followUpQuestion: record.followUpQuestion.trim(),
    },
  };
}

/**
 * Attempts to parse and validate text as FeedbackStructure
 */
function parseAndValidate(rawText: string | undefined): { success: true; feedback: FeedbackStructure } | { success: false; reason: string } {
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

  const validation = validateFeedback(parsed);
  if (!validation.valid) {
    return { success: false, reason: validation.reason };
  }

  return { success: true, feedback: validation.feedback };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body?.question;
    const answer = body?.answer;

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

    if (
      question.length > 1000 ||
      answer.length > MAX_ANSWER_LENGTH
    ) {
      return NextResponse.json(
        { error: "The question or answer is too long." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const primaryPrompt = `You are a fair, constructive SBI PO interview evaluator.

Evaluate the candidate's answer to the interview question below.
Judge relevance, completeness, clarity and factual accuracy.
Assess banking knowledge only when the question calls for it.
Do not invent facts about the candidate or penalize reasonable answers simply because they use different wording.

QUESTION:
${question.trim()}

CANDIDATE ANSWER:
${answer.trim()}

CRITICAL INSTRUCTIONS:
You must respond with ONLY a single valid JSON object.
Do NOT include Markdown formatting, code fences (like \`\`\`json), or explanatory notes.
Do NOT omit any field. All fields are mandatory.

Your output must strictly conform to this JSON schema:
{
  "score": <integer from 1 to 10>,
  "relevance": "<string explaining relevance and completeness>",
  "bankingKnowledge": "<string evaluating banking knowledge or 'Not applicable'>",
  "strengths": ["<string: specific strength 1>", "<string: specific strength 2>"],
  "improvements": ["<string: specific improvement 1>", "<string: specific improvement 2>"],
  "suggestedAnswer": "<string: a stronger model answer>",
  "followUpQuestion": "<string: one relevant follow-up question for the interview panel>"
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

    // If first attempt failed, make one retry with a stricter JSON repair prompt
    if (!result.success) {
      console.warn("First Gemini evaluation attempt failed validation:", result.reason, "- Retrying once with stricter prompt.");

      const retryPrompt = `You are an automated JSON evaluation formatter.
Evaluate this interview answer and return ONLY valid, parseable JSON conforming to the schema below.

QUESTION:
${question.trim()}

CANDIDATE ANSWER:
${answer.trim()}

SCHEMA REQUIRED:
{
  "score": 7,
  "relevance": "string",
  "bankingKnowledge": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "suggestedAnswer": "string",
  "followUpQuestion": "string"
}

Ensure "score" is an integer between 1 and 10.
Ensure "strengths" and "improvements" are non-empty arrays of strings.
Output MUST be raw JSON without markdown fences.`;

      const retryResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: retryPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      result = parseAndValidate(retryResponse.text);

      if (!result.success) {
        console.error("Gemini evaluation retry also failed validation. Diagnostic details:", {
          reason: result.reason,
          rawResponseLength: retryResponse.text ? retryResponse.text.length : 0,
        });

        return NextResponse.json(
          { error: "Unable to evaluate the answer due to an unexpected format from the evaluator. Please try again." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ success: true, feedback: result.feedback });
  } catch (error) {
    console.error("Answer evaluation failed:", error instanceof Error ? error.message : "Unknown error");

    return NextResponse.json(
      { error: "Unable to evaluate the answer. Please try again." },
      { status: 502 }
    );
  }
}
