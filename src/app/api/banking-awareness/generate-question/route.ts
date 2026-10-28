import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getDiverseChunk, getInstantGroundedQuestion } from "@/lib/bankingAwarenessService";
import { BankingAwarenessQuestion, QuestionType } from "@/lib/bankingAwarenessTypes";

// Strips markdown code blocks (```json ... ``` or ``` ...) and whitespace
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
  }
  return text.trim();
}

const QUESTION_TYPES: QuestionType[] = ["conceptual", "definition", "factual", "scenario"];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const excludedChunkIds: string[] = Array.isArray(body.excludedChunkIds) ? body.excludedChunkIds : [];
    const excludedQuestions: string[] = Array.isArray(body.excludedQuestions) ? body.excludedQuestions : [];

    // FAST PATH: Return an instant verified question from BBM_PRO_2026 Ebook bank (<5ms)
    const instantQuestion = getInstantGroundedQuestion(excludedQuestions);
    if (instantQuestion) {
      return NextResponse.json({
        success: true,
        question: instantQuestion,
      });
    }

    // FALLBACK: If bank is exhausted or not loaded, generate dynamically from ebook chunks
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const chunk = getDiverseChunk(excludedChunkIds);
    if (!chunk || !chunk.content) {
      return NextResponse.json(
        { error: "No banking awareness content available in the PDF ebook." },
        { status: 500 }
      );
    }

    const preferredType = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
    const excerpt = chunk.content.slice(0, 1400);
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an SBI PO Interview Panelist.
Generate 1 interview question based SOLELY on this excerpt from "BBM_PRO_2026 Ebook.pdf" (Page ${chunk.approxPage}).
- Strictly use facts in this excerpt. Do NOT use outside knowledge.
- Avoid repeating: ${excludedQuestions.slice(-5).join(" | ") || "None"}
- Target style: ${preferredType.toUpperCase()}

EXCERPT:
${excerpt}

Output JSON only:
{
  "topic": "Topic Name from excerpt",
  "questionType": "${preferredType}",
  "question": "Clear SBI PO question from excerpt",
  "hint": "Brief preparation hint from excerpt",
  "expectedKeyPoints": ["Point 1 from excerpt", "Point 2 from excerpt"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const raw = response.text || "{}";
    const parsed = JSON.parse(cleanJsonText(raw));

    if (!parsed.question || typeof parsed.question !== "string" || parsed.question.length < 10) {
      throw new Error("Generated question failed quality validation.");
    }

    const questionObj: BankingAwarenessQuestion = {
      id: `ba-q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      chunkId: chunk.id,
      approxPage: chunk.approxPage,
      topic: parsed.topic || chunk.title,
      questionType: parsed.questionType || preferredType,
      question: parsed.question.trim(),
      hint: parsed.hint || "Review key definitions and statutory norms from the ebook.",
      expectedKeyPoints: Array.isArray(parsed.expectedKeyPoints) ? parsed.expectedKeyPoints : [],
    };

    return NextResponse.json({
      success: true,
      question: questionObj,
    });
  } catch (error: unknown) {
    console.error("Banking Awareness Question Generation Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate question from PDF.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
