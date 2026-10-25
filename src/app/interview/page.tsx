"use client";

import Link from "next/link";
import { useState, useRef, useId, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  type EvaluationFeedback,
  type InterviewTurn,
  type InterviewQuestion,
} from "@/lib/questions";
import { useInterviewVoice } from "@/lib/useInterviewVoice";
import { generateInterviewReportPdf } from "@/lib/pdfReportGenerator";

const TOTAL_SESSION_QUESTIONS = 10;
const MAX_FOLLOW_UPS_PER_MAIN = 2; // Capped at at-most 2 follow-ups only when needed
const MAX_CHARS = 5000;

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#0a2540]">Initializing Interview Session...</p>
          </div>
        </div>
      }
    >
      <InterviewSessionRouter />
    </Suspense>
  );
}

function InterviewSessionRouter() {
  const searchParams = useSearchParams();
  // Using searchParams.toString() as a unique React key ensures that whenever a candidate
  // begins a new interview session (with a fresh sid or changed configuration), React
  // immediately unmounts the old session state and initializes a completely clean interview.
  const sessionKey = searchParams.toString();
  return <InterviewSessionContent key={sessionKey} />;
}

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const interviewMode = searchParams.get("mode") === "current_affairs" ? "current_affairs" : "full_mock";
  const difficulty = searchParams.get("difficulty") === "easy" || searchParams.get("difficulty") === "hard" ? searchParams.get("difficulty")! : "moderate";
  const timeWindow = searchParams.get("timeWindow") === "3_months" || searchParams.get("timeWindow") === "12_months" ? searchParams.get("timeWindow")! : "6_months";
  const categoryParam = searchParams.get("categories");
  const selectedCategories = useMemo(
    () => (categoryParam ? categoryParam.split(",").filter(Boolean) : []),
    [categoryParam]
  );

  // Voice mode settings & hook
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  // Hook handles TTS (speaking) and STT (microphone recognition) with self-pickup prevention
  const {
    isVoiceSupported,
    isRecognitionSupported,
    voiceState,
    interimTranscript,
    voiceErrorMessage,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    resetVoiceState,
  } = useInterviewVoice({
    onTranscriptUpdate: (newTranscript) => {
      setAnswer(newTranscript);
      if (validationError) setValidationError(null);
      if (errorMessage) setErrorMessage(null);
    },
  });

  // Session tracking: current main question index and completed turns history
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionTurns, setSessionTurns] = useState<InterviewTurn[]>([]);
  const currentQuestionIndexRef = useRef(0);
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // Session questions: state starts null while Gemini generates 10 fresh questions
  const [sessionQuestions, setSessionQuestions] = useState<InterviewQuestion[] | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);

  // Prevent duplicate requests during React development double-mounts
  const hasRequestedSessionRef = useRef<boolean>(false);

  // Dynamically generate all 10 questions via Gemini across all categories & CA pillars
  // Uses sessionStorage caching so page refreshes DO NOT burn API quota!
  useEffect(() => {
    if (hasRequestedSessionRef.current) return;
    hasRequestedSessionRef.current = true;

    // Fetch fresh dynamic AI questions from Gemini
    async function loadDynamicSession() {
      setIsSessionLoading(true);
      setSessionLoadError(null);
      try {
        const res = await fetch("/api/generate-interview-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: interviewMode,
            difficulty,
            timeWindow,
            categories: selectedCategories,
          }),
        });
        const data = await res.json();
        if (data?.success && Array.isArray(data.questions) && data.questions.length === 10) {
          setSessionQuestions(data.questions);
        } else {
          throw new Error(data?.error || "Failed to generate interview questions.");
        }
      } catch (err) {
        console.error("Session generation error:", err);
        setSessionLoadError(
          err instanceof Error ? err.message : "Unable to reach Gemini API. Please click retry below."
        );
      } finally {
        setIsSessionLoading(false);
      }
    }

    loadDynamicSession();
  }, [interviewMode, difficulty, timeWindow, selectedCategories]);

  // Follow-up flow state for the CURRENT main question
  const [followUpCount, setFollowUpCount] = useState(0);
  const [activeFollowUpQuestion, setActiveFollowUpQuestion] = useState<string | null>(null);
  const [isFollowUpTurn, setIsFollowUpTurn] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  // Completion state: set to true when session ends (normally or via Skip/Close)
  const [isCompleted, setIsCompleted] = useState(false);

  // Final report state — populated after isCompleted becomes true
  interface CategoryBreakdown {
    category: string;
    averageScore: number;
    turnCount: number;
    assessment: string;
  }
  interface AnswerImprovement {
    question: string;
    suggestion: string;
  }
  interface ReportData {
    overallScore: number;
    answeredCount: number;
    totalSessionQuestions: number;
    completionRate: number;
    answerQualityRate: number;
    overallAssessment: string;
    categoryBreakdown: CategoryBreakdown[];
    strengths: string[];
    improvementAreas: string[];
    priorityTopics: string[];
    answerImprovements: AnswerImprovement[];
    interviewMode?: string;
    difficulty?: string;
    timeWindow?: string;
    readinessAssessment: string;
  }
  const [report, setReport] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  function handleDownloadPdf() {
    if (!report) return;
    try {
      setIsDownloadingPdf(true);
      generateInterviewReportPdf({
        report,
        sessionTurns,
        sessionQuestions: sessionQuestions || [],
        interviewMode,
        difficulty,
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  // Current active main question from the dynamic session
  const currentMainQuestion: InterviewQuestion | undefined =
    sessionQuestions ? sessionQuestions[currentQuestionIndex] || sessionQuestions[0] : undefined;

  // Active question text displayed to the candidate
  const activeQuestionText = isFollowUpTurn && activeFollowUpQuestion
    ? activeFollowUpQuestion
    : currentMainQuestion?.question || "";

  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Evaluating Answer...");
  const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const textareaId = useId();
  const reportRef = useRef<HTMLDivElement>(null);

  const charCount = answer.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Track the last question that was spoken to avoid repeated triggers
  const lastSpokenQuestionRef = useRef<string>("");

  // Read the active question aloud when voice mode is enabled and the question changes
  useEffect(() => {
    if (!isVoiceMode || !isVoiceSupported || !hasUserInteracted || isCompleted) return;
    if (lastSpokenQuestionRef.current === activeQuestionText) return;

    lastSpokenQuestionRef.current = activeQuestionText;

    const timer = setTimeout(() => {
      speakText(activeQuestionText, () => {
        if (isVoiceMode && isRecognitionSupported && !isCompleted) {
          startListening("");
        }
      });
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [
    activeQuestionText,
    isVoiceMode,
    isVoiceSupported,
    hasUserInteracted,
    isCompleted,
    isRecognitionSupported,
    speakText,
    startListening,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Prevent submission if loading or completed
    if (isLoading || isCompleted) return;

    // Ensure voice recording and speaking are stopped upon submission
    stopListening();
    stopSpeaking();

    // Reset previous errors
    setValidationError(null);
    setErrorMessage(null);

    // Client-side validation: Reject empty or whitespace-only answers
    const trimmed = answer.trim();
    if (!trimmed) {
      setValidationError("Please enter your answer before submitting.");
      return;
    }

    if (charCount > MAX_CHARS) {
      setValidationError(`Your answer exceeds the maximum limit of ${MAX_CHARS.toLocaleString()} characters.`);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Evaluating Answer...");

    try {
      // 1. Evaluate the candidate's answer via evaluate-answer API
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: activeQuestionText,
          answer: trimmed,
          difficulty,
          mode: interviewMode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.feedback) {
        throw new Error(data.error || "Unable to evaluate the answer. Please try again.");
      }

      const evalFeedback: EvaluationFeedback = data.feedback;

      if (!currentMainQuestion) {
        throw new Error("Interview question not loaded. Please try again.");
      }

      // 2. Preserve turn in session history upon successful evaluation
      const completedTurn: InterviewTurn = {
        turnId: `turn-${Date.now()}-${currentQuestionIndex + 1}${isFollowUpTurn ? `-fu${followUpCount}` : ""}`,
        questionId: isFollowUpTurn ? undefined : currentMainQuestion.id,
        mainQuestionId: currentMainQuestion.id,
        category: currentMainQuestion.category,
        question: activeQuestionText,
        isFollowUp: isFollowUpTurn,
        followUpIndex: isFollowUpTurn ? followUpCount : undefined,
        answer: trimmed,
        feedback: evalFeedback,
        timestamp: Date.now(),
      };

      // Keep full history of evaluated turns
      const updatedTurns = [...sessionTurns, completedTurn];
      setSessionTurns(updatedTurns);
      setErrorMessage(null);

      // Reset input form state for the next turn
      resetVoiceState();
      setAnswer("");
      setFeedback(null);
      setValidationError(null);
      setShowHint(false);

      // 3. Adaptive follow-up decision — use the followUpQuestion returned by evaluate-answer
      const followUpsAnsweredSoFar = isFollowUpTurn ? followUpCount : 0;
      const canAskAnotherFollowUp = followUpsAnsweredSoFar < MAX_FOLLOW_UPS_PER_MAIN;

      if (
        canAskAnotherFollowUp &&
        typeof evalFeedback.followUpQuestion === "string" &&
        evalFeedback.followUpQuestion.trim().length > 0
      ) {
        // Automatically proceed into the follow-up question
        setIsFollowUpTurn(true);
        setFollowUpCount((prev) => prev + 1);
        setActiveFollowUpQuestion(evalFeedback.followUpQuestion.trim());
        setFollowUpError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // No follow-up needed or allowed: advance to next main question or finish
        setActiveFollowUpQuestion(null);
        setFollowUpError(null);

        if (currentQuestionIndex + 1 >= TOTAL_SESSION_QUESTIONS) {
          // Finished all 10 questions!
          setIsCompleted(true);
          generateReport(updatedTurns);
        } else {
          // Proceed to next main question
          setCurrentQuestionIndex((prev) => prev + 1);
          setFollowUpCount(0);
          setIsFollowUpTurn(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to evaluate the answer. Please try again.";
      setErrorMessage(msg);
      setFeedback(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage("Evaluating Answer...");
    }
  }

  function handleReset() {
    resetVoiceState();
    setAnswer("");
    setFeedback(null);
    setErrorMessage(null);
    setValidationError(null);
    setShowHint(false);
  }

  /**
   * Calls /api/generate-interview-report with all evaluated turns collected so far.
   * Only turns with a populated feedback object are submitted.
   * Safe to call with an empty turns array — the API will return an error which
   * is surfaced as reportError.
   */
  async function generateReport(turns: InterviewTurn[]) {
    // Prevent duplicate concurrent requests
    if (isGeneratingReport) return;

    const evaluatedTurns = turns.filter((t) => t.feedback);
    if (evaluatedTurns.length === 0) {
      setReportError("No evaluated answers found. Answer at least one question to generate your report.");
      setIsGeneratingReport(false);
      return;
    }

    setIsGeneratingReport(true);
    setReportError(null);
    setReport(null);

    // Scroll to where the report will appear
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const res = await fetch("/api/generate-interview-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turns: evaluatedTurns,
          interviewMode,
          difficulty,
          timeWindow,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.report) {
        throw new Error(data.error || "Unable to generate report. Please try again.");
      }
      setReport(data.report);
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : "Unable to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  }

  /**
   * Skip the current question (or follow-up) without submitting an answer.
   * - Follow-up turn: exits follow-up mode, stays on the same main question index.
   * - Main turn: advances to the next main question.
   * - On Q10: ends the session and generates the report.
   */
  function handleSkipQuestion() {
    if (isLoading || isCompleted) return;

    // Immediately stop mic and audio on skip
    stopListening();
    stopSpeaking();

    // If skipping a follow-up, just exit follow-up mode without advancing main index
    if (isFollowUpTurn) {
      setIsFollowUpTurn(false);
      setActiveFollowUpQuestion(null);
      setFollowUpCount(0);
      setFollowUpError(null);
      setAnswer("");
      setFeedback(null);
      setErrorMessage(null);
      setValidationError(null);
      setShowHint(false);
      // If this was the last main question's follow-up, end the session
      if (currentQuestionIndex + 1 >= TOTAL_SESSION_QUESTIONS) {
        setIsCompleted(true);
        generateReport(sessionTurns);
      } else {
        // Advance to next main question
        setCurrentQuestionIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    // Skipping a main question
    if (currentQuestionIndex + 1 >= TOTAL_SESSION_QUESTIONS) {
      // Last question — end the session
      setIsCompleted(true);
      generateReport(sessionTurns);
    } else {
      // Advance to next main question
      setCurrentQuestionIndex((prev) => prev + 1);
      setFollowUpCount(0);
      setIsFollowUpTurn(false);
      setActiveFollowUpQuestion(null);
      setFollowUpError(null);
      setAnswer("");
      setFeedback(null);
      setErrorMessage(null);
      setValidationError(null);
      setShowHint(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /**
   * Close the interview early and generate the final report from turns so far.
   * Ends the session regardless of which question is currently active.
   */
  function handleCloseInterview() {
    if (isLoading || isCompleted) return;

    // Immediately stop mic and audio on close
    stopListening();
    stopSpeaking();

    setIsCompleted(true);
    generateReport(sessionTurns);
  }

  /* Progress calculation based on current MAIN question position */
  const currentNumber = isCompleted ? TOTAL_SESSION_QUESTIONS : currentQuestionIndex + 1;
  const progressPct = isCompleted
    ? 100
    : Math.round(((currentNumber - 1) / TOTAL_SESSION_QUESTIONS) * 100);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* ── Interview Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-[#0a2540] text-white flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L3 7v3h18V7l-9-5z"
                />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-base font-bold text-[#0a2540] leading-tight truncate">
                SBI PO <span className="text-amber-600">Interview Coach</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Mock Interview Session
              </span>
            </div>
          </div>

          {/* Session & AI Origin badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCompleted ? "bg-emerald-600" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>{isCompleted ? "Interview Completed" : "Live Session"}</span>
            </div>

            {/* AI Source Indicator */}
            {sessionQuestions && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-900 border-emerald-300"
                title="Dynamically formulated by Google Gemini AI"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                <span>Gemini AI: Dynamic Questions</span>
              </div>
            )}
          </div>

          {/* Header action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {!isCompleted ? (
              <>
                {/* Skip Question */}
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  disabled={isLoading}
                  title={isFollowUpTurn ? "Skip this follow-up question" : "Skip to next question"}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span className="hidden sm:inline">Skip Question</span>
                </button>
                {/* Close Interview → generates report */}
                <button
                  type="button"
                  onClick={handleCloseInterview}
                  disabled={isLoading}
                  title="End interview and view your final report"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-white border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Close Interview</span>
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="hidden sm:inline">Return Home</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interview Progress
            </span>
            <div className="flex items-center gap-2">
              {isFollowUpTurn && !isCompleted && (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                  Follow-Up {followUpCount} of {MAX_FOLLOW_UPS_PER_MAIN}
                </span>
              )}
              <span className="text-xs font-bold text-[#0a2540]">
                {isCompleted ? (
                  <span className="text-emerald-700">All 10 Questions Completed</span>
                ) : (
                  `Question ${currentNumber} of ${TOTAL_SESSION_QUESTIONS}`
                )}
              </span>
            </div>
          </div>
          {/* Progress track */}
          <div
            className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            aria-label={`Interview progress: ${
              isCompleted
                ? "Completed all 10 questions"
                : `question ${currentNumber} of ${TOTAL_SESSION_QUESTIONS}`
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-[#0a2540] to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct === 0 ? 2 : progressPct}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {Array.from({ length: TOTAL_SESSION_QUESTIONS }, (_, i) => {
              const isPast = isCompleted || i < currentQuestionIndex;
              const isCurrent = !isCompleted && i === currentQuestionIndex;
              return (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    isPast
                      ? "bg-[#0a2540] w-6"
                      : isCurrent
                      ? "bg-amber-500 w-6"
                      : "bg-slate-300 w-3"
                  }`}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Question Generation Loading State ── */}
          {isSessionLoading && (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-lg p-10 sm:p-14 text-center my-8">
              <div className="w-16 h-16 rounded-2xl bg-[#0a2540]/5 border border-[#0a2540]/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 animate-spin text-[#0a2540]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a2540] mb-2">
                {interviewMode === "current_affairs"
                  ? "Crafting 10 Verified Current Affairs Questions..."
                  : "Generating Your 10-Question Dynamic Interview Session..."}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-4">
                {interviewMode === "current_affairs"
                  ? "Selecting official developments from RBI, Ministry of Finance, and PIB within your time window. Grounding questions 100% in verified circulars."
                  : "Google Gemini 3.5 is formulating a custom, non-repeating 10-question panel set calibrated to your selected difficulty standard."}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Zero pre-baked templates • Fresh AI generation</span>
              </div>
            </div>
          )}

          {/* ── Error State if generation completely fails ── */}
          {!isSessionLoading && sessionLoadError && !currentMainQuestion && (
            <div className="rounded-3xl border border-red-200 bg-red-50/70 p-10 text-center my-8">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-red-900 mb-2">Unable to Load Interview Questions</h2>
              <p className="text-xs text-red-700 max-w-md mx-auto mb-6">{sessionLoadError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-[#0a2540] text-white rounded-xl text-xs font-bold hover:bg-[#071b30] shadow-sm transition-all"
              >
                Retry Generation
              </button>
            </div>
          )}

          {/* ── Active Session Content (Visible once questions are loaded) ── */}
          {!isSessionLoading && currentMainQuestion && (
            <>
              {/* Category & Turn Badges */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0a2540]/5 border border-[#0a2540]/20 text-[#0a2540] text-xs font-semibold rounded-full">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {currentMainQuestion.category}
            </span>

            {/* Difficulty Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${
              difficulty === "hard"
                ? "bg-red-50 text-red-800 border-red-300"
                : difficulty === "easy"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-blue-50 text-blue-800 border-blue-300"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                difficulty === "hard" ? "bg-red-600" : difficulty === "easy" ? "bg-emerald-600" : "bg-blue-600"
              }`} />
              {difficulty.toUpperCase()}
            </span>

            {/* Mode badge if dedicated CA */}
            {interviewMode === "current_affairs" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-300">
                Current Affairs ({timeWindow.replace("_", " ")})
              </span>
            )}

            {isFollowUpTurn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                Adaptive Follow-Up {followUpCount}/{MAX_FOLLOW_UPS_PER_MAIN} (Main Question {currentNumber})
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium">
                Main Question {currentNumber} of {TOTAL_SESSION_QUESTIONS}
              </span>
            )}
          </div>

          {/* Verified Current Affairs Event Badge (if question is grounded in official news) */}
          {currentMainQuestion.isCurrentAffairs && currentMainQuestion.sourceName && (
            <div className="mb-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-[#0a2540] text-amber-300 text-[10px] uppercase tracking-wide">
                  Verified Official Source
                </span>
                <span className="font-semibold text-slate-800">
                  {currentMainQuestion.sourceName}
                </span>
                {currentMainQuestion.sourceUrl && (
                  <a
                    href={currentMainQuestion.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                  >
                    Source Link
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                {currentMainQuestion.publishedAt && (
                  <span>
                    <strong>Event Date:</strong> {currentMainQuestion.publishedAt}
                  </span>
                )}
                {currentMainQuestion.retrievedAt && (
                  <span className="hidden sm:inline border-l border-slate-300 pl-3">
                    <strong>Verified:</strong> {currentMainQuestion.retrievedAt}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className={`bg-white rounded-2xl border-2 shadow-sm p-6 sm:p-8 mb-6 ${
            isFollowUpTurn ? "border-amber-300 bg-amber-50/20" : "border-[#0a2540]/10"
          }`}>
            <div className="flex items-start gap-4">
              {/* Panel icon */}
              <div className={`shrink-0 w-10 h-10 rounded-xl text-white flex items-center justify-center mt-0.5 ${
                isFollowUpTurn ? "bg-amber-600" : "bg-[#0a2540]"
              }`}>
                {isFollowUpTurn ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className={isFollowUpTurn ? "text-amber-700 font-bold" : "text-slate-400"}>
                    {isFollowUpTurn ? `Panel Cross-Examination (Follow-Up ${followUpCount}/${MAX_FOLLOW_UPS_PER_MAIN})` : "Interview Panel"}
                  </span>
                </p>
                <p className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
                  &ldquo;{activeQuestionText}&rdquo;
                </p>

                {/* Voice Assistant Audio Control Strip */}
                {isVoiceSupported && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setHasUserInteracted(true);
                        if (voiceState === "speaking") {
                          stopSpeaking();
                        } else {
                          speakText(activeQuestionText, () => {
                            if (isVoiceMode && isRecognitionSupported && !feedback && !isCompleted) {
                              startListening(answer);
                            }
                          });
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        voiceState === "speaking"
                          ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {voiceState === "speaking" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                          <span>Speaking... (Click to Stop)</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          <span>Read Question Aloud</span>
                        </>
                      )}
                    </button>

                    {/* Mode Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        setHasUserInteracted(true);
                        setIsVoiceMode((prev) => !prev);
                        if (voiceState === "speaking") stopSpeaking();
                        if (voiceState === "listening") stopListening();
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 transition-colors ml-auto"
                    >
                      <span className={`w-2 h-2 rounded-full ${isVoiceMode ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{isVoiceMode ? "Voice Mode: Active" : "Voice Mode: Paused"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Hint toggle (Only for main questions where hint exists) */}
            {!isFollowUpTurn && currentMainQuestion.hint && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                  aria-expanded={showHint}
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${showHint ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {showHint ? "Hide hint" : "Show answering hint"}
                </button>
                {showHint && (
                  <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 leading-relaxed">
                    💡 {currentMainQuestion.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Voice status or error alert */}
          {voiceErrorMessage && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <span className="text-base">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold">{voiceErrorMessage}</p>
                <p className="mt-1 text-amber-700">You can continue answering by typing directly in the box below, or click retry to check microphone permissions.</p>
              </div>
              <button
                type="button"
                onClick={() => startListening(answer)}
                className="shrink-0 px-2.5 py-1 bg-amber-200/60 hover:bg-amber-200 rounded font-bold text-amber-900"
              >
                Retry Mic
              </button>
            </div>
          )}

          {/* Answer Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Textarea header with Voice Mic Controls */}
              <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={textareaId}
                    className="text-sm font-semibold text-slate-700"
                  >
                    Your Answer {isFollowUpTurn && `(To Follow-Up ${followUpCount})`}
                  </label>
                  {isRecognitionSupported && (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                      Voice + Text Review
                    </span>
                  )}
                </div>

                {/* Microphone action button */}
                {isRecognitionSupported && !feedback && !isCompleted && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Mark that user interacted
                        setHasUserInteracted(true);
                        // Prevent the question from auto-reading when the user explicitly wants to answer
                        lastSpokenQuestionRef.current = activeQuestionText;
                        stopSpeaking();

                        if (voiceState === "listening") {
                          stopListening();
                        } else {
                          startListening(answer);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                        voiceState === "listening"
                          ? "bg-red-600 text-white animate-pulse hover:bg-red-700 ring-2 ring-red-400 ring-offset-1"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {voiceState === "listening" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>Stop Recording (Done Speaking)</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span>{answer.trim().length > 0 ? "Add More by Voice" : "Speak Your Answer"}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Live speech recording feedback indicator */}
              {voiceState === "listening" && (
                <div className="px-5 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                    </span>
                    <span className="font-semibold">Microphone active — Listening to your answer...</span>
                    {interimTranscript && (
                      <span className="italic text-emerald-700 bg-white/70 px-2 py-0.5 rounded border border-emerald-200">
                        &ldquo;{interimTranscript}&rdquo;
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium hidden sm:inline">
                    Speak clearly into your mic
                  </span>
                </div>
              )}

              <textarea
                id={textareaId}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (validationError) setValidationError(null);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading || isCompleted}
                placeholder={
                  isFollowUpTurn
                    ? "Respond specifically to the panel's follow-up question..."
                    : "Begin your answer here. For example: 'I am [Name], a graduate in [Subject] from [University]...'"
                }
                rows={10}
                className="w-full px-5 py-4 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-white leading-relaxed disabled:bg-slate-50 disabled:text-slate-500"
                aria-describedby="char-count-hint"
                spellCheck
              />

              {/* Footer: char count + submit */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Character count */}
                <div id="char-count-hint" className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono font-semibold tabular-nums ${
                      isOverLimit ? "text-red-600" : "text-slate-500"
                    }`}
                  >
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                  </span>
                  {isOverLimit && (
                    <span className="text-xs text-red-600 font-medium">
                      {charCount - MAX_CHARS} over limit
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {answer.trim().length > 0 && !isCompleted && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
                    >
                      Clear &amp; Start Over
                    </button>
                  )}

                  {!isCompleted && (
                    <button
                      type="submit"
                      disabled={isLoading || isOverLimit}
                      className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#0a2540] hover:bg-[#071b30] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin text-amber-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>{loadingMessage}</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Answer</span>
                          <svg
                            className="w-4 h-4 text-amber-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Client-side validation message */}
            {validationError && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{validationError}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 flex items-start gap-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Evaluation Error</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Recoverable Follow-Up Notification */}
            {followUpError && (
              <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-300 rounded-lg px-4 py-2.5">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">Follow-Up Note</p>
                  <p>{followUpError}</p>
                </div>
              </div>
            )}
          </form>

          {/* ── Session Ended Banner + Final Report ── */}
          {isCompleted && (
            <div ref={reportRef} className="mt-8 space-y-6">
              {/* Session ended header */}
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-6 sm:p-8 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a2540] mb-2">
                  Interview Session Ended
                </h2>
                <p className="text-sm text-slate-700 max-w-xl mx-auto leading-relaxed mb-2">
                  {sessionTurns.filter((t) => t.feedback).length > 0
                    ? `You answered ${sessionTurns.filter((t) => t.feedback).length} question${sessionTurns.filter((t) => t.feedback).length !== 1 ? "s" : ""}. Your final performance report is being generated below.`
                    : "Your session has ended. Answer at least one question to see your performance report."}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2"
                >
                  Return to Home
                </Link>
              </div>

              {/* Report loading state */}
              {isGeneratingReport && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-md p-8 text-center">
                  <svg className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-sm font-semibold text-[#0a2540]">Preparing your interview report...</p>
                  <p className="text-xs text-slate-500 mt-1">Analyzing your responses and preparing feedback</p>
                </div>
              )}

              {/* Report error */}
              {reportError && !isGeneratingReport && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-sm font-semibold text-red-800 mb-1">Report Generation Failed</p>
                  <p className="text-xs text-red-700 mb-4">{reportError}</p>
                  <button
                    type="button"
                    onClick={() => generateReport(sessionTurns)}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0a2540] hover:bg-[#071b30] rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2"
                  >
                    Retry Report
                  </button>
                </div>
              )}

              {/* Final Report */}
              {report && !isGeneratingReport && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
                  {/* Report header with overall score */}
                  <div className="px-6 py-6 bg-[#0a2540] text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-extrabold text-white">Final Performance Report</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-slate-300">
                            {report.interviewMode === "current_affairs" ? "Dedicated Current Affairs Interview" : "SBI PO Full Mock Interview"}
                          </span>
                          {report.difficulty && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-[#0a2540]">
                              {report.difficulty} Standard
                            </span>
                          )}
                          {report.timeWindow && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-400/30">
                              {report.timeWindow.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Overall score and metrics */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Download PDF Button in Header */}
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          disabled={isDownloadingPdf}
                          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0a2540] font-bold text-xs rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                          title="Download Comprehensive PDF Report"
                        >
                          <svg className="w-4 h-4 text-[#0a2540]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{isDownloadingPdf ? "Preparing PDF..." : "Download Report (PDF)"}</span>
                        </button>

                        {/* Overall exam score */}
                        <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-2.5 rounded-xl">
                          <div className="text-center">
                            <span className="block text-3xl font-extrabold text-amber-400 font-mono leading-none">{report.overallScore}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">/ 100</span>
                          </div>
                          <div className="text-xs text-slate-300 leading-tight">
                            <span className="block font-semibold text-white">Exam Score</span>
                            <span>Weighted (10 Qs)</span>
                          </div>
                        </div>

                        {/* Answer Quality Rate */}
                        <div className="bg-white/10 border border-white/20 px-3.5 py-2.5 rounded-xl text-center">
                          <span className="block text-lg font-extrabold text-emerald-400 font-mono leading-tight">{report.answerQualityRate}%</span>
                          <span className="text-[10px] text-slate-300 block">Quality Rate</span>
                        </div>

                        {/* Completion badge */}
                        <div className="bg-white/10 border border-white/20 px-3.5 py-2.5 rounded-xl text-center">
                          <span className="block text-lg font-extrabold text-amber-300 font-mono leading-tight">
                            {report.answeredCount} / {report.totalSessionQuestions}
                          </span>
                          <span className="text-[10px] text-slate-300 block">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Overall Assessment */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#0a2540]" />
                        Overall Assessment
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{report.overallAssessment}</p>
                    </div>

                    {/* Category Breakdown */}
                    {report.categoryBreakdown.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] mb-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Category Breakdown
                        </h3>
                        <div className="space-y-3">
                          {report.categoryBreakdown.map((cat) => (
                            <div key={cat.category} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-1.5 gap-3 flex-wrap">
                                <span className="text-xs font-bold text-[#0a2540]">{cat.category}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[11px] text-slate-500">{cat.turnCount} turn{cat.turnCount !== 1 ? "s" : ""}</span>
                                  <span className="text-sm font-extrabold text-amber-600 font-mono">{cat.averageScore.toFixed(1)}<span className="text-xs font-normal text-slate-400">/10</span></span>
                                </div>
                              </div>
                              {/* Score bar */}
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div
                                  className="h-full bg-gradient-to-r from-[#0a2540] to-amber-500 rounded-full transition-all"
                                  style={{ width: `${Math.round((cat.averageScore / 10) * 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{cat.assessment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths & Improvement Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Key Strengths
                        </h3>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {report.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Areas for Improvement
                        </h3>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {report.improvementAreas.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Priority Revision Topics */}
                    <div className="bg-[#0a2540]/5 border border-[#0a2540]/15 rounded-xl p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] mb-3 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Priority Revision Topics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {report.priorityTopics.map((topic, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-white border border-[#0a2540]/20 text-[#0a2540] rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Answer Improvement Suggestions */}
                    {report.answerImprovements.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] mb-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          Answer Improvement Suggestions
                        </h3>
                        <div className="space-y-3">
                          {report.answerImprovements.map((item, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <p className="text-xs font-semibold text-[#0a2540] mb-1.5 italic">
                                &ldquo;{item.question}&rdquo;
                              </p>
                              <p className="text-xs text-slate-700 leading-relaxed">{item.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Readiness Assessment */}
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Readiness Assessment
                      </h3>
                      <p className="text-sm text-blue-900 leading-relaxed">{report.readinessAssessment}</p>
                    </div>

                    {/* Comprehensive Question-by-Question Evaluation Breakdown */}
                    {sessionTurns.filter((t) => t.feedback).length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] mb-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0a2540]" />
                          Question-by-Question Evaluation
                        </h3>
                        <div className="space-y-4">
                          {sessionTurns
                            .filter((t) => t.feedback)
                            .map((turn, idx) => {
                              const fb = turn.feedback!;
                              return (
                                <div
                                  key={turn.turnId || idx}
                                  className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
                                >
                                  {/* Turn Header */}
                                  <div className="bg-[#0a2540] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold bg-amber-400 text-[#0a2540] px-2 py-0.5 rounded">
                                        {turn.isFollowUp ? `Follow-Up ${turn.followUpIndex || 1}` : `Q${idx + 1}`}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-200">
                                        {turn.category}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded text-xs">
                                      <span className="text-slate-300 font-medium text-[11px]">Score:</span>
                                      <span className="font-extrabold text-amber-400 font-mono text-sm">
                                        {fb.score}
                                      </span>
                                      <span className="text-slate-400 text-[10px]">/ 10</span>
                                    </div>
                                  </div>

                                  <div className="p-4 space-y-3 text-xs">
                                    {/* Question & Candidate's Answer */}
                                    <div>
                                      <p className="font-bold text-[#0a2540] mb-1">
                                        Question: &ldquo;{turn.question}&rdquo;
                                      </p>
                                      <div className="bg-white p-3 rounded border border-slate-200 text-slate-700 italic leading-relaxed">
                                        <strong>Your Answer:</strong> &ldquo;{turn.answer}&rdquo;
                                      </div>
                                    </div>

                                    {/* Relevance & Banking Knowledge */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                      <div className="bg-white p-2.5 rounded border border-slate-200">
                                        <span className="font-bold text-[#0a2540] block mb-1">
                                          Relevance &amp; Completeness
                                        </span>
                                        <p className="text-slate-600 leading-relaxed">{fb.relevance}</p>
                                      </div>
                                      <div className="bg-white p-2.5 rounded border border-slate-200">
                                        <span className="font-bold text-[#0a2540] block mb-1">
                                          Banking Knowledge
                                        </span>
                                        <p className="text-slate-600 leading-relaxed">{fb.bankingKnowledge}</p>
                                      </div>
                                    </div>

                                    {/* Strengths & Improvements */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                      <div className="bg-emerald-50/70 border border-emerald-200 rounded p-2.5">
                                        <span className="font-bold text-emerald-900 block mb-1">
                                          Key Strengths
                                        </span>
                                        <ul className="space-y-1 text-slate-700">
                                          {fb.strengths.map((str, sIdx) => (
                                            <li key={sIdx} className="flex items-start gap-1">
                                              <span className="text-emerald-600 font-bold">•</span>
                                              <span>{str}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div className="bg-amber-50/70 border border-amber-200 rounded p-2.5">
                                        <span className="font-bold text-amber-900 block mb-1">
                                          Areas for Improvement
                                        </span>
                                        <ul className="space-y-1 text-slate-700">
                                          {fb.improvements.map((imp, iIdx) => (
                                            <li key={iIdx} className="flex items-start gap-1">
                                              <span className="text-amber-600 font-bold">•</span>
                                              <span>{imp}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    {/* Suggested Model Response */}
                                    {fb.suggestedAnswer && (
                                      <div className="bg-blue-50/50 border border-blue-200/80 rounded p-3">
                                        <span className="font-bold text-blue-900 block mb-1">
                                          Suggested High-Scoring Response:
                                        </span>
                                        <p className="text-slate-700 italic leading-relaxed">
                                          &ldquo;{fb.suggestedAnswer}&rdquo;
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-[#0a2540] bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-[#0a2540]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{isDownloadingPdf ? "Preparing PDF Report..." : "Download Full Report (PDF)"}</span>
                      </button>
                      <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#0a2540] hover:bg-[#071b30] rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2"
                      >
                        Return to Home
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Disclaimer: This is an independent educational platform not affiliated with SBI or IBPS.
          </p>
          <Link href="/" className="font-semibold text-[#0a2540] hover:underline shrink-0">
            SBI PO Interview Coach
          </Link>
        </div>
      </footer>
    </div>
  );
}
