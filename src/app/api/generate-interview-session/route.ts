import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { VERIFIED_CURRENT_AFFAIRS } from "@/lib/currentAffairsData";
import { InterviewQuestion, buildRandomizedSession } from "@/lib/questions";

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

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured." },
        { status: 500 }
      );
    }

    // 1. Pick 2 random verified current affairs topics across distinct pillars
    const pillar1Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "RBI & Banking Awareness");
    const pillar2Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "Government Schemes & Economy");
    const pillar3Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "National & International Current Affairs");

    const candidatePillars = getRandomItems([pillar1Items, pillar2Items, pillar3Items], 2);
    const selectedAffairs: typeof VERIFIED_CURRENT_AFFAIRS = [];
    for (const pillarGroup of candidatePillars) {
      if (pillarGroup.length > 0) {
        selectedAffairs.push(getRandomItems(pillarGroup, 1)[0]);
      }
    }
    if (selectedAffairs.length < 2) {
      const remaining = VERIFIED_CURRENT_AFFAIRS.filter((item) => !selectedAffairs.some((s) => s.id === item.id));
      selectedAffairs.push(...getRandomItems(remaining, 2 - selectedAffairs.length));
    }

    const ai = new GoogleGenAI({ apiKey });

    const affairsContext = selectedAffairs
      .map((item, idx) => {
        return `[CA Event ${idx + 1}]
Pillar: ${item.pillar}
Headline: ${item.title}
Official Source: ${item.sourceName} (${item.publishedAt})
Verified Facts:
${item.keyFacts.map((f) => `- ${f}`).join("\n")}
Summary: ${item.summary}`;
      })
      .join("\n\n");

    const prompt = `You are a distinguished State Bank of India (SBI) Probationary Officer interview board panelist conducting Phase-III mock interviews.

Generate a completely fresh, balanced, professional 10-question SBI PO interview set.

DISTRIBUTION REQUIREMENT (EXACTLY 10 QUESTIONS):
- Questions 1 & 2: "Personal & HR" (motivation to join SBI, background, rural posting readiness, conflict handling, strengths/weaknesses).
- Questions 3 & 4: "Banking Awareness & RBI" (monetary policy transmission, CRR/SLR, NPA stages, Basel III/CAR, Priority Sector Lending).
- Questions 5 & 6: "SBI & Digital Banking" (YONO, financial inclusion/BC model, cyber fraud prevention, retail banking vs fintech, customer service).
- Questions 7 & 8: "Situational Judgment" (branch crowd management, angry customer dispute, loan KYC pressure, cash balancing mismatch, ethics).
- Questions 9 & 10: "Current Affairs" (strictly grounded in the verified official data provided below).

<<<VERIFIED_CURRENT_AFFAIRS_START>>>
${affairsContext}
<<<VERIFIED_CURRENT_AFFAIRS_END>>>

STRICT REQUIREMENTS:
1. Every question must be distinct, realistic, high-caliber, and non-repetitive.
2. For Current Affairs (Q9, Q10), ground questions strictly in the verified events provided above.
3. Provide a high-scoring candidate answering "hint" for each question.
4. Output MUST be ONLY a single valid JSON array with exactly 10 questions in this structure:

[
  {
    "id": "dyn-hr-1",
    "category": "Personal & HR",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-hr-2",
    "category": "Personal & HR",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-bank-1",
    "category": "Banking Awareness & RBI",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-bank-2",
    "category": "Banking Awareness & RBI",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-sbi-1",
    "category": "SBI & Digital Banking",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-sbi-2",
    "category": "SBI & Digital Banking",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-sit-1",
    "category": "Situational Judgment",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-sit-2",
    "category": "Situational Judgment",
    "question": "...",
    "isCurrentAffairs": false,
    "hint": "..."
  },
  {
    "id": "dyn-ca-1",
    "category": "Current Affairs",
    "question": "...",
    "isCurrentAffairs": true,
    "hint": "..."
  },
  {
    "id": "dyn-ca-2",
    "category": "Current Affairs",
    "question": "...",
    "isCurrentAffairs": true,
    "hint": "..."
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
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed) || parsed.length !== 10) {
      throw new Error(`Invalid questions length received: ${Array.isArray(parsed) ? parsed.length : 0}`);
    }

    const validCategories = [
      "Personal & HR",
      "Banking Awareness & RBI",
      "SBI & Digital Banking",
      "Situational Judgment",
      "Current Affairs",
    ];

    const questions: InterviewQuestion[] = parsed.map((q: Record<string, unknown>, index: number) => {
      const category = validCategories.includes(q.category as string)
        ? (q.category as InterviewQuestion["category"])
        : index < 2
        ? "Personal & HR"
        : index < 4
        ? "Banking Awareness & RBI"
        : index < 6
        ? "SBI & Digital Banking"
        : index < 8
        ? "Situational Judgment"
        : "Current Affairs";

      return {
        id: `gen-${Date.now()}-${index + 1}`,
        category,
        question: typeof q.question === "string" ? q.question.trim() : "",
        isCurrentAffairs: category === "Current Affairs",
        hint: typeof q.hint === "string" ? q.hint.trim() : "",
      };
    });

    const isValid = questions.every((q) => q.question.length > 10);
    if (!isValid) {
      throw new Error("One or more generated questions failed validation.");
    }

    return NextResponse.json({
      success: true,
      questions,
      sourceEvents: selectedAffairs.map((s) => ({
        id: s.id,
        title: s.title,
        source: s.sourceName,
        date: s.publishedAt,
      })),
    });
  } catch (error) {
    console.error("Full session generation error, falling back to randomized curated session:", error);
    const fallbackQuestions = buildRandomizedSession();
    return NextResponse.json({
      success: true,
      questions: fallbackQuestions,
      isFallback: true,
    });
  }
}
