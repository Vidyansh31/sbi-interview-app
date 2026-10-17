import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { VERIFIED_CURRENT_AFFAIRS } from "@/lib/currentAffairsData";
import { InterviewQuestion } from "@/lib/questions";

// Strips markdown code blocks (```json ... ``` or ``` ...) and whitespace
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
  }
  return text.trim();
}

/**
 * Fisher-Yates shuffle helper to randomly select items without replacement
 */
function getRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function POST(request: Request) {
  try {
    let count = 2;
    try {
      const body = await request.json();
      if (typeof body?.count === "number" && body.count > 0 && body.count <= 5) {
        count = body.count;
      }
    } catch {
      // Default to 2 questions if body empty or invalid
      count = 2;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured." },
        { status: 500 }
      );
    }

    // 1. Pick random verified current affairs topics across distinct pillars
    // Ensure representation of Pillar 1 (RBI & Banking), Pillar 2 (Govt Schemes & Economy), and Pillar 3 (National & International)
    const pillar1Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "RBI & Banking Awareness");
    const pillar2Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "Government Schemes & Economy");
    const pillar3Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "National & International Current Affairs");

    // Randomly pick items from distinct pillars
    const candidatePillars = getRandomItems([pillar1Items, pillar2Items, pillar3Items], count);
    const selectedAffairs: typeof VERIFIED_CURRENT_AFFAIRS = [];
    for (const pillarGroup of candidatePillars) {
      if (pillarGroup.length > 0) {
        selectedAffairs.push(getRandomItems(pillarGroup, 1)[0]);
      }
    }

    // Fallback if needed to fulfill count
    if (selectedAffairs.length < count) {
      const remaining = VERIFIED_CURRENT_AFFAIRS.filter((item) => !selectedAffairs.some((s) => s.id === item.id));
      selectedAffairs.push(...getRandomItems(remaining, count - selectedAffairs.length));
    }

    const ai = new GoogleGenAI({ apiKey });

    // 2. Build grounded prompt for Gemini
    const affairsContext = selectedAffairs
      .map((item, idx) => {
        return `[Event ${idx + 1}]
Pillar: ${item.pillar}
Headline: ${item.title}
Official Source: ${item.sourceName} (${item.publishedAt})
Verified Facts:
${item.keyFacts.map((f) => `- ${f}`).join("\n")}
Summary: ${item.summary}`;
      })
      .join("\n\n");

    const prompt = `You are a distinguished State Bank of India (SBI) Probationary Officer interview board panelist conducting Phase-III mock interviews.

Below are ${selectedAffairs.length} VERIFIED, FACTUAL current affairs items from official sources (RBI, Ministry of Finance, NPCI).

<<<VERIFIED_DATA_START>>>
${affairsContext}
<<<VERIFIED_DATA_END>>>

TASK:
For EACH of the ${selectedAffairs.length} verified events above, generate exactly ONE thoughtful, realistic, professional SBI PO panel interview question.
The question must test the candidate's understanding of the rationale, banking implications, customer impact, or practical branch operational challenges.

STRICT FACTUAL GROUNDING RULES:
1. Ground the question strictly in the facts provided above. Do NOT invent dates, statistics, or non-existent government circulars.
2. Frame questions as probing, analytical, or situational inquiries appropriate for an SBI PO aspirant (e.g. "How should public sector banks balance...", "What are the primary operational challenges branch managers will face...", "Why did RBI intervene to...").
3. Provide a concise, high-value answering "hint" detailing key points a high-scoring candidate should touch upon.
4. Output MUST be ONLY a single valid JSON array matching this schema:

[
  {
    "id": "ca-gen-<unique_short_id>",
    "category": "Current Affairs",
    "question": "<string: concise, formal panel question>",
    "isCurrentAffairs": true,
    "hint": "<string: key points, regulatory rationale, and practical considerations>"
  }
]

Do NOT output markdown backticks, explanations, or text outside the JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response from AI model.");
    }

    const cleaned = cleanJsonText(rawText);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse dynamic current affairs JSON:", parseErr, rawText);
      throw new Error("Invalid JSON returned by evaluator.");
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Response is not a valid question array.");
    }

    const generatedQuestions: InterviewQuestion[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i] as Record<string, unknown>;
      if (
        typeof q.question === "string" &&
        q.question.trim().length > 10 &&
        typeof q.hint === "string"
      ) {
        generatedQuestions.push({
          id: `ca-dyn-${Date.now()}-${i + 1}`,
          category: "Current Affairs",
          question: q.question.trim(),
          isCurrentAffairs: true,
          hint: q.hint.trim(),
        });
      }
    }

    if (generatedQuestions.length === 0) {
      throw new Error("No valid questions could be validated from AI response.");
    }

    return NextResponse.json({
      success: true,
      questions: generatedQuestions,
      sourceEvents: selectedAffairs.map((s) => ({
        id: s.id,
        title: s.title,
        source: s.sourceName,
        date: s.publishedAt,
      })),
    });
  } catch (error) {
    console.error(
      "Dynamic current affairs generation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Fallback: Return curated grounded questions gracefully
    const fallbackAffairs = getRandomItems(VERIFIED_CURRENT_AFFAIRS, 2);
    const fallbackQuestions: InterviewQuestion[] = fallbackAffairs.map((item, idx) => ({
      id: `ca-fallback-${Date.now()}-${idx + 1}`,
      category: "Current Affairs",
      question: `Regarding ${item.title}: How should public sector banks like SBI adapt their branch operations and risk management to align with this development?`,
      isCurrentAffairs: true,
      hint: `${item.summary} Key considerations: ${item.keyFacts.join("; ")}`,
    }));

    return NextResponse.json({
      success: true,
      questions: fallbackQuestions,
      isFallback: true,
    });
  }
}
