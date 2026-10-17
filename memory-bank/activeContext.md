# Active Context & Project Roadmap

## Current State
- **Homepage (`/`)**: Fully implemented responsive landing page with Navy/White/Saffron theme, featuring hero banner, simulation preview, features grid, 3-step how-it-works, free access mission, and footer.
- **Answer Evaluation API (`/api/evaluate-answer`)**: Production-ready POST endpoint utilizing Gemini 3.5 Flash Lite via `@google/genai` to evaluate answers against strict JSON rubrics.
- **Adaptive Follow-Up API (`/api/generate-follow-up`)**: Dedicated POST endpoint generating targeted, non-generic SBI PO panel follow-up questions tailored to candidate answers. Includes strict JSON schema validation, automatic single repair retry, and safe error masking.
- **Interview Report API (`/api/generate-interview-report`)**: POST endpoint (Step 5A). Implements **Option A (Completion-Weighted / SBI PO Exam Style)**:
  - 10 main questions total = 100 maximum exam points (10 points per question).
  - Unanswered or skipped questions contribute 0 points.
  - Overall Exam Score = sum of points earned across completed question topics (e.g. 1 question scored 9/10 results in 9/100).
  - Also calculates `answerQualityRate` (e.g. 90% quality on attempted questions) and `completionRate` (e.g. 10%).
  - Safe error masking, mandatory AI disclaimer in readinessAssessment. Fully connected to the interview UI.
- **Question Bank Module (`src/lib/questions.ts`)**:
  - `InterviewCategory` & `InterviewQuestion` types.
  - `EvaluationFeedback` & `InterviewTurn` types.
  - 20 curated static questions (`QUESTION_BANK`).
- **Interview Screen (`/interview`)**:
  - **Full Adaptive Interview Flow**:
    - Progresses through 10 main questions with at most THREE adaptive follow-ups per main question.
    - After a main question answer is evaluated, uses `feedback.followUpQuestion` directly (from evaluate-answer) to show the follow-up — no separate Gemini call needed.
    - Shows an "Answer Follow-Up Question (X of 3)" action button once follow-up is available.
    - Clicking it smoothly transitions into the follow-up question card (clearly marked as panel cross-question).
    - Answering and evaluating the follow-up records a distinct turn in `sessionTurns` with `isFollowUp: true`.
    - Follow-up counter resets to 0 on advancing to the next main question.
    - Main progress indicators strictly preserve "Question X of 10" and do not advance on follow-ups.

## Recent Changes
- **Full Dynamic 10-Question Session Generation by Gemini**:
  - Created `/api/generate-interview-session` ([`src/app/api/generate-interview-session/route.ts`](file:///d:/InterviewApp/src/app/api/generate-interview-session/route.ts)):
    - Prompts Gemini (`gemini-3.5-flash-lite`) to dynamically generate all 10 questions on the fly for every interview.
    - Strict distribution:
      - Q1 & Q2: Personal & HR
      - Q3 & Q4: Banking Awareness & RBI
      - Q5 & Q6: SBI & Digital Banking
      - Q7 & Q8: Situational Judgment
      - Q9 & Q10: Current Affairs (grounded in the 3 official verified pillars: RBI/Banking, Govt Schemes, National/International).
    - Every question includes custom answering hints for candidates.
    - Zero duplication guaranteed across the 10-question session.
  - Connected to [`src/app/interview/page.tsx`](file:///d:/InterviewApp/src/app/interview/page.tsx):
    - Initializes immediately with randomized curated questions to prevent client lag.
    - Asynchronously generates the full 10-question dynamic set via Gemini on mount.
    - Seamless fallback to randomized curated questions if API key or network fails.
  - Verified production build (`npm run build`, exit code 0).

## Next Planned Steps
- Project features complete (Session Flow, Adaptive Follow-ups, Skip/Close actions, Exam-Style Weighted Report, and Verified Current Affairs). Ready for user testing and deployment.
