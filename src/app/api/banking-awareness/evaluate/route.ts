import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getChunkById } from "@/lib/bankingAwarenessService";
import { BankingAwarenessEvaluation } from "@/lib/bankingAwarenessTypes";

// Strips markdown code blocks (```json ... ``` or ``` ...) and whitespace
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
  }
  return text.trim();
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { question, userAnswer, chunkId, allowFollowUp } = body;

    if (!question || typeof question !== "string" || !userAnswer || typeof userAnswer !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload. Question and answer are required." },
        { status: 400 }
      );
    }

    const chunk = chunkId ? getChunkById(chunkId) : undefined;
    const sourceExcerpt = chunk?.content || "";

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert SBI PO Interview Panel Examiner.
You are evaluating a candidate's answer to a Banking Awareness question.

CRITICAL EVALUATION CONSTRAINTS:
1. Ground your entire evaluation SOLELY on the attached PDF excerpt from "BBM_PRO_2026 Ebook.pdf" (Approx. Page ${chunk?.approxPage || "N/A"}).
2. NEVER use outside general knowledge, updated external circulars, or internet facts not stated in this excerpt.
3. If the user's answer cannot be verified from the excerpt or if the excerpt lacks the necessary details to confirm the user's claims, explicitly state:
   "This claim/answer cannot be verified from the reference PDF ebook."
4. Do NOT invent facts or pretend information is present in the PDF when it is not.
5. Provide a realistic score from 1 to 10 based on how accurately and completely the candidate cited or explained the concepts documented in this excerpt.
6. Provide the exact correct answer and explanation strictly synthesized from the excerpt.
7. If allowFollowUp is true and the user's answer was partially complete or missed a specific nuance mentioned in the PDF excerpt, generate 1 sharp follow-up question (answerable strictly from the excerpt). If the answer was thorough, return null for followUpQuestion.

QUESTION ASKED:
"${question}"

CANDIDATE'S ANSWER:
"${userAnswer}"

ALLOW ADAPTIVE FOLLOW-UP: ${allowFollowUp ? "YES" : "NO"}

<<<SOURCE_PDF_EXCERPT_START>>>
${sourceExcerpt}
<<<SOURCE_PDF_EXCERPT_END>>>

Output format strictly JSON:
{
  "score": 7,
  "feedback": "Concise direct evaluation of the candidate's accuracy according strictly to the ebook excerpt.",
  "correctAnswer": "The comprehensive high-scoring model answer based entirely on the PDF excerpt.",
  "explanation": "Detailed explanation of why this answer is correct with explicit reference to the facts/figures in the PDF excerpt.",
  "strengths": ["Accurately identified X from the text"],
  "improvements": ["Missed mentioning Y documented on this topic in the text"],
  "followUpQuestion": "A targeted follow-up question based strictly on this excerpt, or null if answer was thorough"
}
Do NOT output markdown fences or explanatory text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temperature for strict factual evaluation
      },
    });

    const raw = response.text || "{}";
    const parsed = JSON.parse(cleanJsonText(raw));

    const evalObj: BankingAwarenessEvaluation = {
      score: typeof parsed.score === "number" ? Math.min(10, Math.max(1, Math.round(parsed.score))) : 5,
      feedback: parsed.feedback || "Evaluated against BBM PRO 2026 reference material.",
      correctAnswer: parsed.correctAnswer || "Refer to the BBM PRO 2026 ebook for the standard reference answer.",
      explanation: parsed.explanation || "Verified against the reference PDF text.",
      pdfReference: {
        chunkId: chunk?.id || "pdf-source",
        approxPage: chunk?.approxPage || 1,
        verifiableTopic: chunk?.title || "Banking Awareness Core Module",
      },
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      followUpQuestion: allowFollowUp && typeof parsed.followUpQuestion === "string" && parsed.followUpQuestion.trim().length > 10
        ? parsed.followUpQuestion.trim()
        : null,
    };

    return NextResponse.json({
      success: true,
      evaluation: evalObj,
    });
  } catch (error: unknown) {
    console.error("Banking Awareness Evaluation Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to evaluate answer against PDF.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
