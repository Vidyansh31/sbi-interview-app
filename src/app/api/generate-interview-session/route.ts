import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  VERIFIED_CURRENT_AFFAIRS,
  filterCurrentAffairsByTimeWindow,
  filterCurrentAffairsByCategory,
} from "@/lib/currentAffairsData";
import {
  InterviewDifficulty,
  InterviewMode,
  TimeWindow,
  CurrentAffairsCategory,
  VerifiedCurrentAffairItem,
} from "@/lib/currentAffairsTypes";
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
  let mode: InterviewMode = "full_mock";
  let difficulty: InterviewDifficulty = "moderate";
  let timeWindow: TimeWindow = "6_months";
  let selectedCategories: CurrentAffairsCategory[] = [];

  try {
    const body = await request.json().catch(() => ({}));
    if (body.mode === "current_affairs") {
      mode = "current_affairs";
    }
    if (body.difficulty === "easy" || body.difficulty === "moderate" || body.difficulty === "hard") {
      difficulty = body.difficulty;
    }
    if (body.timeWindow === "3_months" || body.timeWindow === "6_months" || body.timeWindow === "12_months") {
      timeWindow = body.timeWindow;
    }
    if (Array.isArray(body.categories) && body.categories.length > 0) {
      selectedCategories = body.categories;
    }
  } catch {
    // Defaults apply
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // ─────────────────────────────────────────────────────────────────────────
    // MODE 1: DEDICATED CURRENT AFFAIRS INTERVIEW (100% verified news events)
    // ─────────────────────────────────────────────────────────────────────────
    if (mode === "current_affairs") {
      // 1. Filter verified current affairs by selected time window and categories
      let availableItems = filterCurrentAffairsByTimeWindow(VERIFIED_CURRENT_AFFAIRS, timeWindow);
      if (selectedCategories.length > 0) {
        availableItems = filterCurrentAffairsByCategory(availableItems, selectedCategories);
      }

      // If strict filter yielded fewer than 5 items, fallback to all window items to avoid fake/empty generation
      if (availableItems.length < 5) {
        availableItems = filterCurrentAffairsByTimeWindow(VERIFIED_CURRENT_AFFAIRS, timeWindow);
      }

      // Pick up to 10 verified items
      const selectedAffairs: VerifiedCurrentAffairItem[] = getRandomItems(
        availableItems,
        Math.min(10, availableItems.length)
      );

      // If database has fewer than 10 items in this exact window, loop/cycle them deterministically
      const targetAffairs: VerifiedCurrentAffairItem[] = [];
      for (let i = 0; i < 10; i++) {
        targetAffairs.push(selectedAffairs[i % selectedAffairs.length]);
      }

      const affairsContext = targetAffairs
        .map((item, idx) => {
          return `[Event ${idx + 1}]
Headline: ${item.title}
Category: ${item.category}
Official Source: ${item.sourceName} (${item.sourceUrl})
Event Publication Date: ${item.publishedAt}
Verification Timestamp: ${item.retrievedAt}
Verified Facts:
${item.keyFacts.map((f) => `- ${f}`).join("\n")}
Context: ${item.summary}`;
        })
        .join("\n\n");

      const caPrompt = `You are an executive panelist on the State Bank of India (SBI) PO Interview Board conducting a dedicated, high-stakes Current Affairs Interview.
Target Difficulty: "${difficulty.toUpperCase()}".
Time Window: "${timeWindow.replace("_", " ")}".

Generate exactly 10 authentic, incisive interview questions grounded 100% in the verified events below.

DIFFICULTY GUIDELINES:
- Easy: Straightforward factual comprehension, key definitions, primary objectives, and direct impacts of the event/scheme on public banking and citizens.
- Moderate: Standard SBI PO interview level. Involves analytical reasoning, implications on monetary policy/banking operations/economy, and balanced trade-offs.
- Hard: Deep policy analysis, cross-sectoral ramifications, macroeconomic vulnerabilities, critical regulatory examination, and strategic managerial judgment.

CRITICAL FACTUAL GROUNDING RULES:
1. Every single question MUST be grounded SOLELY in its corresponding verified event below.
2. DO NOT include generic HR, bio-data, or unrelated static banking questions.
3. NEVER invent or hallucinate news events, dates, figures, circulars, or sources.
4. Output MUST be ONLY a single valid JSON array containing exactly 10 questions.

<<<VERIFIED_EVENTS_START>>>
${affairsContext}
<<<VERIFIED_EVENTS_END>>>

Output format strictly:
[
  {
    "index": 1,
    "question": "...",
    "hint": "..."
  },
  ...
  {
    "index": 10,
    "question": "...",
    "hint": "..."
  }
]
Do NOT output markdown fences or explanatory text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: caPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8,
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from AI model.");

      const parsed = JSON.parse(cleanJsonText(rawText));
      if (!Array.isArray(parsed) || parsed.length !== 10) {
        throw new Error(`Expected 10 questions, received ${Array.isArray(parsed) ? parsed.length : 0}`);
      }

      const questions: InterviewQuestion[] = parsed.map((q: Record<string, unknown>, index: number) => {
        const affair = targetAffairs[index];
        return {
          id: `ca-${Date.now()}-${index + 1}`,
          category: "Current Affairs",
          question: typeof q.question === "string" ? q.question.trim() : "",
          isCurrentAffairs: true,
          hint: typeof q.hint === "string" ? q.hint.trim() : "",
          difficulty,
          sourceName: affair.sourceName,
          sourceUrl: affair.sourceUrl,
          publishedAt: affair.publishedAt,
          retrievedAt: affair.retrievedAt,
        };
      });

      return NextResponse.json({
        success: true,
        mode: "current_affairs",
        difficulty,
        timeWindow,
        questions,
        sourceEvents: targetAffairs.map((s) => ({
          id: s.id,
          title: s.title,
          source: s.sourceName,
          date: s.publishedAt,
          retrievedAt: s.retrievedAt,
          category: s.category,
        })),
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MODE 2: REGULAR FULL MOCK INTERVIEW (with Difficulty calibration)
    // ─────────────────────────────────────────────────────────────────────────
    const pillar1Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "RBI & Banking Awareness");
    const pillar2Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "Government Schemes & Economy");
    const pillar3Items = VERIFIED_CURRENT_AFFAIRS.filter((item) => item.pillar === "National & International Current Affairs");

    const candidatePillars = getRandomItems([pillar1Items, pillar2Items, pillar3Items], 2);
    const selectedAffairs: VerifiedCurrentAffairItem[] = [];
    for (const pillarGroup of candidatePillars) {
      if (pillarGroup.length > 0) {
        selectedAffairs.push(getRandomItems(pillarGroup, 1)[0]);
      }
    }
    if (selectedAffairs.length < 2) {
      const remaining = VERIFIED_CURRENT_AFFAIRS.filter((item) => !selectedAffairs.some((s) => s.id === item.id));
      selectedAffairs.push(...getRandomItems(remaining, 2 - selectedAffairs.length));
    }

    const affairsContext = selectedAffairs
      .map((item, idx) => {
        return `[CA Event ${idx + 1}]
Headline: ${item.title}
Official Source: ${item.sourceName} (${item.publishedAt})
Verified Facts:
${item.keyFacts.map((f) => `- ${f}`).join("\n")}
Summary: ${item.summary}`;
      })
      .join("\n\n");

    const difficultyGuidance = {
      easy: `DIFFICULTY: EASY
- Common HR & personal motivation (why SBI, career switch, strength/weakness, basic customer handling).
- Basic banking, RBI, and SBI awareness (definition of repo rate, CRR, savings vs current accounts, basic YONO features).
- Straightforward, encouraging questions requiring clear fundamental clarity without aggressive traps.`,
      moderate: `DIFFICULTY: MODERATE (Standard SBI PO Phase-III)
- Balanced interview-standard questions spanning personal motivation, banking mechanisms, and branch ethics.
- Questions requiring conceptual explanation, reasoning, practical banking application, and structured answers.`,
      hard: `DIFFICULTY: HARD (Advanced Executive Panel)
- In-depth, analytical probing: complex monetary policy transmission, asset-liability mismatches (ALM), Basel III capital adequacy buffers, credit risk modeling.
- Challenging situational judgment (ethical dilemmas, branch liquidity crunch, high-pressure audit disputes).
- Demands high-level strategic reasoning, financial maturity, and nuanced regulatory knowledge.`,
    }[difficulty];

    const randomAngleSeed = Math.floor(Math.random() * 100000);
    const prompt = `You are a distinguished State Bank of India (SBI) Probationary Officer interview board panelist conducting Phase-III mock interviews.
Session Variation Seed: ${randomAngleSeed}. Ensure questions are distinct, varied in phrasing, and explore novel angles from standard question sets.

Generate a completely fresh, balanced, professional 10-question SBI PO interview set.

${difficultyGuidance}

DISTRIBUTION REQUIREMENT (EXACTLY 10 QUESTIONS):
- Questions 1 & 2: "Personal & HR" (motivation to join SBI, background, rural posting readiness, conflict handling, career aspirations).
- Questions 3 & 4: "Banking Awareness & RBI" (monetary policy transmission, CRR/SLR, NPA stages, Basel III/CAR, Priority Sector Lending).
- Questions 5 & 6: "SBI & Digital Banking" (YONO, financial inclusion/BC model, cyber fraud prevention, retail banking vs fintech, customer service).
- Questions 7 & 8: "Situational Judgment" (branch crowd management, angry customer dispute, loan KYC pressure, cash balancing mismatch, ethics).
- Questions 9 & 10: "Current Affairs" (strictly grounded in the verified official data provided below).

<<<VERIFIED_CURRENT_AFFAIRS_START>>>
${affairsContext}
<<<VERIFIED_CURRENT_AFFAIRS_END>>>

STRICT REQUIREMENTS:
1. Calibrate question sophistication to the specified difficulty (${difficulty.toUpperCase()}).
2. For Current Affairs (Q9, Q10), ground questions strictly in the verified events provided above.
3. Provide a high-scoring candidate answering "hint" for each question.
4. Output MUST be ONLY a single valid JSON array with exactly 10 questions in this structure:

[
  { "id": "dyn-hr-1", "category": "Personal & HR", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-hr-2", "category": "Personal & HR", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-bank-1", "category": "Banking Awareness & RBI", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-bank-2", "category": "Banking Awareness & RBI", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-sbi-1", "category": "SBI & Digital Banking", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-sbi-2", "category": "SBI & Digital Banking", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-sit-1", "category": "Situational Judgment", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-sit-2", "category": "Situational Judgment", "question": "...", "isCurrentAffairs": false, "hint": "..." },
  { "id": "dyn-ca-1", "category": "Current Affairs", "question": "...", "isCurrentAffairs": true, "hint": "..." },
  { "id": "dyn-ca-2", "category": "Current Affairs", "question": "...", "isCurrentAffairs": true, "hint": "..." }
]

Do NOT output markdown backticks, explanations, or text outside the JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    const rawText = response.text;
    if (!rawText) throw new Error("Empty response from AI model.");

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

      const isCA = category === "Current Affairs";
      const caEvent = isCA ? (index === 8 ? selectedAffairs[0] : selectedAffairs[1]) : undefined;

      return {
        id: `gen-${Date.now()}-${index + 1}`,
        category,
        question: typeof q.question === "string" ? q.question.trim() : "",
        isCurrentAffairs: isCA,
        hint: typeof q.hint === "string" ? q.hint.trim() : "",
        difficulty,
        sourceName: caEvent?.sourceName,
        sourceUrl: caEvent?.sourceUrl,
        publishedAt: caEvent?.publishedAt,
        retrievedAt: caEvent?.retrievedAt,
      };
    });

    const isValid = questions.every((q) => q.question.length > 10);
    if (!isValid) {
      throw new Error("One or more generated questions failed validation.");
    }

    return NextResponse.json({
      success: true,
      mode: "full_mock",
      difficulty,
      questions,
      sourceEvents: selectedAffairs.map((s) => ({
        id: s.id,
        title: s.title,
        source: s.sourceName,
        date: s.publishedAt,
        retrievedAt: s.retrievedAt,
      })),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const is429 = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED");
    const userMessage = is429
      ? "Gemini API rate limit reached. Please wait a moment and click Retry Generation."
      : "Unable to generate interview questions right now. Please click Retry Generation.";

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        rateLimited: is429,
      },
      { status: is429 ? 429 : 500 }
    );
  }
}
