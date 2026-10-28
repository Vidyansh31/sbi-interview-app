"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useId, useCallback } from "react";
import {
  BankingAwarenessQuestion,
  BankingAwarenessEvaluation,
  PracticeTurn,
} from "@/lib/bankingAwarenessTypes";
import { useInterviewVoice } from "@/lib/useInterviewVoice";
import { generateBankingAwarenessPdfReport } from "@/lib/bankingAwarenessPdfGenerator";

const MAX_CHARS = 4000;
const SESSION_HISTORY_STORAGE_KEY = "sbi_ba_asked_questions";

export default function BankingAwarenessPage() {
  const [currentQuestion, setCurrentQuestion] = useState<BankingAwarenessQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Active answer state
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Adaptive Follow-up tracking for the current main question (capped at 2)
  const [followUpCount, setFollowUpCount] = useState<number>(0);
  const [activeFollowUpQuestion, setActiveFollowUpQuestion] = useState<string | null>(null);

  // Evaluation & Session Turn History
  const [currentEvaluation, setCurrentEvaluation] = useState<BankingAwarenessEvaluation | null>(null);
  const [sessionTurns, setSessionTurns] = useState<PracticeTurn[]>([]);
  const [attemptedCount, setAttemptedCount] = useState<number>(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Excluded history to guarantee no duplicate questions across sessions
  const [askedQuestionTexts, setAskedQuestionTexts] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SESSION_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(-50);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [visitedChunkIds, setVisitedChunkIds] = useState<string[]>([]);

  const textareaId = useId();

  // Voice integration
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const {
    isVoiceSupported,
    isRecognitionSupported,
    voiceState,
    interimTranscript,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    resetVoiceState,
  } = useInterviewVoice({
    onTranscriptUpdate: (newTranscript) => {
      setAnswer(newTranscript);
      if (validationError) setValidationError(null);
      if (submitError) setSubmitError(null);
    },
  });

  // Prefetch queue for near-instant question transitions
  const preloadedQuestionRef = useRef<BankingAwarenessQuestion | null>(null);
  const isPrefetchingRef = useRef<boolean>(false);

  // Background prefetch function to have the next question already waiting
  const prefetchNextQuestion = useCallback(async (currentChunks: string[], askedList: string[]) => {
    if (isPrefetchingRef.current || preloadedQuestionRef.current) return;
    isPrefetchingRef.current = true;
    try {
      const res = await fetch("/api/banking-awareness/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excludedChunkIds: currentChunks,
          excludedQuestions: askedList,
        }),
      });
      const data = await res.json();
      if (data?.success && data.question) {
        preloadedQuestionRef.current = data.question;
      }
    } catch {
      // background prefetch fails silently
    } finally {
      isPrefetchingRef.current = false;
    }
  }, []);

  // Fetch a new question from the PDF knowledge base
  const fetchNextQuestion = useCallback(async (excludeChunkId?: string) => {
    setQuestionError(null);
    setAnswer("");
    setCurrentEvaluation(null);
    setActiveFollowUpQuestion(null);
    setFollowUpCount(0);
    setShowHint(false);
    setValidationError(null);
    setSubmitError(null);
    resetVoiceState();

    const currentChunks = excludeChunkId
      ? [...visitedChunkIds, excludeChunkId]
      : visitedChunkIds;

    // 1. If we already have a preloaded question waiting in memory, use it INSTANTLY
    if (preloadedQuestionRef.current) {
      const preloaded = preloadedQuestionRef.current;
      preloadedQuestionRef.current = null;
      setCurrentQuestion(preloaded);
      setIsLoadingQuestion(false);

      const nextChunks = [...currentChunks.slice(-30), preloaded.chunkId];
      const nextAsked = [...askedQuestionTexts, preloaded.question];

      setVisitedChunkIds(nextChunks);
      setAskedQuestionTexts(nextAsked);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(nextAsked.slice(-60)));
        } catch {
          // ignore
        }
      }

      // Prefetch the one after that
      setTimeout(() => {
        prefetchNextQuestion(nextChunks, nextAsked);
      }, 300);
      return;
    }

    // 2. Otherwise load via API
    setIsLoadingQuestion(true);
    try {
      const res = await fetch("/api/banking-awareness/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excludedChunkIds: currentChunks,
          excludedQuestions: askedQuestionTexts,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.question) {
        throw new Error(data.error || "Unable to generate a question from the PDF.");
      }

      const q: BankingAwarenessQuestion = data.question;
      setCurrentQuestion(q);
      const nextChunks = [...currentChunks.slice(-30), q.chunkId];
      const nextAsked = [...askedQuestionTexts, q.question];

      setVisitedChunkIds(nextChunks);
      setAskedQuestionTexts(nextAsked);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(nextAsked.slice(-60)));
        } catch {
          // ignore
        }
      }

      // Start prefetching the following question in the background right away!
      setTimeout(() => {
        prefetchNextQuestion(nextChunks, nextAsked);
      }, 500);
    } catch (err: unknown) {
      console.error("Fetch question error:", err);
      setQuestionError(err instanceof Error ? err.message : "Failed to load question from PDF.");
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [visitedChunkIds, askedQuestionTexts, resetVoiceState, prefetchNextQuestion]);

  // Initial load
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  const activeQuestionText = activeFollowUpQuestion || currentQuestion?.question || "";

  // Auto-speak question if voice mode is active
  useEffect(() => {
    if (isVoiceMode && isVoiceSupported && activeQuestionText && !currentEvaluation) {
      const timer = setTimeout(() => {
        speakText(activeQuestionText);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeQuestionText, isVoiceMode, isVoiceSupported, currentEvaluation, speakText]);

  // Submit Answer handler
  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !currentQuestion) return;

    stopListening();
    stopSpeaking();
    setValidationError(null);
    setSubmitError(null);

    const trimmed = answer.trim();
    if (trimmed.length < 3) {
      setValidationError("Please enter an answer before submitting for evaluation.");
      return;
    }

    setIsSubmitting(true);

    try {
      const isFollowUp = Boolean(activeFollowUpQuestion);
      const allowFollowUp = !isFollowUp && followUpCount < 2;

      const res = await fetch("/api/banking-awareness/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQuestionText,
          userAnswer: trimmed,
          chunkId: currentQuestion.chunkId,
          allowFollowUp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.evaluation) {
        throw new Error(data.error || "Unable to evaluate answer against PDF.");
      }

      const evalData: BankingAwarenessEvaluation = data.evaluation;
      setCurrentEvaluation(evalData);
      setAttemptedCount((c) => c + 1);

      // Record Turn
      const newTurn: PracticeTurn = {
        id: `turn-${Date.now()}`,
        question: {
          ...currentQuestion,
          question: activeQuestionText, // record the actual question text asked (main or follow-up)
        },
        userAnswer: trimmed,
        isFollowUp,
        followUpIndex: isFollowUp ? followUpCount + 1 : undefined,
        evaluation: evalData,
        timestamp: Date.now(),
      };
      setSessionTurns((prev) => [...prev, newTurn]);
    } catch (err: unknown) {
      console.error("Evaluation error:", err);
      setSubmitError(err instanceof Error ? err.message : "Failed to evaluate answer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Proceed to Follow-up
  function handleProceedToFollowUp() {
    if (!currentEvaluation?.followUpQuestion) return;
    setActiveFollowUpQuestion(currentEvaluation.followUpQuestion);
    setFollowUpCount((c) => c + 1);
    setCurrentEvaluation(null);
    setAnswer("");
    resetVoiceState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Skip question - also records it into sessionTurns with empty answer so it appears in PDF!
  function handleSkipQuestion() {
    stopListening();
    stopSpeaking();

    if (currentQuestion) {
      const skippedTurn: PracticeTurn = {
        id: `turn-skipped-${Date.now()}`,
        question: {
          ...currentQuestion,
          question: activeQuestionText,
        },
        userAnswer: "",
        isFollowUp: Boolean(activeFollowUpQuestion),
        followUpIndex: activeFollowUpQuestion ? followUpCount + 1 : undefined,
        timestamp: Date.now(),
      };
      setSessionTurns((prev) => [...prev, skippedTurn]);
    }

    fetchNextQuestion(currentQuestion?.chunkId);
  }

  // Download PDF Report handler
  function handleDownloadReport() {
    if (sessionTurns.length === 0) {
      alert("No questions have been attempted or skipped yet. Practice at least one question to download the report.");
      return;
    }

    try {
      setIsDownloadingPdf(true);
      generateBankingAwarenessPdfReport({
        sessionTurns,
        totalAttempted: attemptedCount,
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  const charCount = answer.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg bg-[#0a2540] text-white flex items-center justify-center hover:bg-[#071b30] transition-colors"
              title="Return to Home"
            >
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-[#0a2540] leading-tight">
                  Banking Awareness Practice
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  BBM PRO 2026 Ebook
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Questions &amp; evaluations strictly grounded in reference PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Questions Attempted Badge */}
            <div className="bg-[#0a2540]/5 border border-[#0a2540]/15 px-3 py-1 rounded-xl text-xs font-semibold text-[#0a2540] flex items-center gap-1.5">
              <span>Attempted:</span>
              <span className="font-extrabold font-mono text-amber-600 text-sm">{attemptedCount}</span>
            </div>

            {/* Download Report Button */}
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={isDownloadingPdf || sessionTurns.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0a2540] bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-all cursor-pointer"
              title={sessionTurns.length === 0 ? "Attempt or skip a question to enable report download" : "Download PDF of all questions asked in this session"}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">{isDownloadingPdf ? "Saving PDF..." : "Download Report"}</span>
              <span className="sm:hidden">{isDownloadingPdf ? "Saving..." : "PDF"}</span>
              {sessionTurns.length > 0 && (
                <span className="bg-[#0a2540] text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full ml-0.5">
                  {sessionTurns.length}
                </span>
              )}
            </button>

            {/* Close Practice Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              Close Practice
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Source Fidelity Notice */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-bold">📄 Strict PDF Grounding:</span>
            <span>All questions, scoring, and explanations come exclusively from <strong>BBM_PRO_2026 Ebook.pdf</strong>.</span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
            Zero Web Hallucination
          </span>
        </div>

        {/* Loading State */}
        {isLoadingQuestion && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-10 h-10 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-[#0a2540]">Retrieving Topic from BBM PRO 2026 Ebook...</p>
            <p className="text-xs text-slate-500 mt-1">Formulating a fresh, unrepeated interview question</p>
          </div>
        )}

        {/* Error State */}
        {questionError && !isLoadingQuestion && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-red-800">{questionError}</p>
            <button
              type="button"
              onClick={() => fetchNextQuestion()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Retry Question
            </button>
          </div>
        )}

        {/* Active Question Card */}
        {currentQuestion && !isLoadingQuestion && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Question Header Meta */}
              <div className="bg-[#0a2540] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-amber-400 text-[#0a2540] uppercase tracking-wider">
                    {activeFollowUpQuestion ? `Follow-Up ${followUpCount}` : currentQuestion.questionType.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    Topic: {currentQuestion.topic}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <span>PDF Reference:</span>
                  <span className="text-amber-300 font-bold">~Page {currentQuestion.approxPage}</span>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                  {activeFollowUpQuestion ? "Panel Follow-Up Cross-Examination" : "Panel Question"}
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                  &ldquo;{activeQuestionText}&rdquo;
                </h2>

                {/* Voice Bar */}
                {isVoiceSupported && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (voiceState === "speaking") {
                          stopSpeaking();
                        } else {
                          speakText(activeQuestionText);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
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

                    <button
                      type="button"
                      onClick={() => setIsVoiceMode((v) => !v)}
                      className="text-slate-500 hover:text-slate-800 text-[11px] font-medium cursor-pointer"
                    >
                      Voice Mode: {isVoiceMode ? "Enabled" : "Off"}
                    </button>
                  </div>
                )}

                {/* Hint Dropdown */}
                {currentQuestion.hint && !activeFollowUpQuestion && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowHint((h) => !h)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                    >
                      <span>{showHint ? "Hide Hint" : "Show Ebook Hint"}</span>
                      <svg className={`w-3.5 h-3.5 transition-transform ${showHint ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showHint && (
                      <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
                        💡 {currentQuestion.hint}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Answer Input Form */}
            {!currentEvaluation && (
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <label htmlFor={textareaId} className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Your Answer {activeFollowUpQuestion && "(To Follow-Up)"}
                    </label>

                    {/* Microphone toggle */}
                    {isRecognitionSupported && (
                      <button
                        type="button"
                        onClick={() => {
                          if (voiceState === "listening") {
                            stopListening();
                          } else {
                            startListening(answer);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          voiceState === "listening"
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {voiceState === "listening" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span>Stop Mic</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            <span>Speak Answer</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {voiceState === "listening" && (
                    <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      <span>Listening... Speak your answer clearly.</span>
                      {interimTranscript && (
                        <span className="italic text-emerald-700 ml-1">&ldquo;{interimTranscript}&rdquo;</span>
                      )}
                    </div>
                  )}

                  <textarea
                    id={textareaId}
                    rows={6}
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Enter your detailed answer based on your knowledge of this topic..."
                    className="w-full px-5 py-4 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none"
                    disabled={isSubmitting}
                  />

                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className={`text-xs font-mono font-medium ${isOverLimit ? "text-red-600" : "text-slate-500"}`}>
                      {charCount} / {MAX_CHARS} characters
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSkipQuestion}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                      >
                        Skip Question
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || isOverLimit}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-bold text-white bg-[#0a2540] hover:bg-[#071b30] disabled:bg-slate-300 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying with PDF...</span>
                          </>
                        ) : (
                          <span>Submit for Evaluation</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {validationError && (
                  <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {validationError}
                  </p>
                )}
                {submitError && (
                  <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {submitError}
                  </p>
                )}
              </form>
            )}

            {/* AI Evaluation Dossier Card (Post-Submission) */}
            {currentEvaluation && (
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden space-y-5 p-6 sm:p-8">
                {/* Score Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                      PDF-Grounded Evaluation
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0a2540]">
                      Accuracy Assessment
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 bg-[#0a2540] text-white px-4 py-2.5 rounded-xl">
                    <span className="text-xs text-slate-300 font-medium">Panel Score:</span>
                    <span className="text-2xl font-extrabold text-amber-400 font-mono leading-none">
                      {currentEvaluation.score}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ 10</span>
                  </div>
                </div>

                {/* Candidate's Submitted Answer */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-[#0a2540] uppercase tracking-wider block mb-1">
                    Your Response:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{answer}&rdquo;
                  </p>
                </div>

                {/* Panel Feedback & Explanation */}
                <div className="space-y-3">
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1.5">
                      <span>Examiner Feedback:</span>
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {currentEvaluation.feedback}
                    </p>
                  </div>

                  {/* Correct Answer Strictly Grounded in PDF */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center gap-1.5">
                      <span>Correct Model Answer (From BBM PRO 2026 Ebook):</span>
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium mb-2">
                      &ldquo;{currentEvaluation.correctAnswer}&rdquo;
                    </p>
                    <p className="text-[11px] text-emerald-800 border-t border-emerald-200/80 pt-2 leading-relaxed">
                      <strong>Ebook Citation/Explanation:</strong> {currentEvaluation.explanation}
                    </p>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="font-bold text-emerald-800 block mb-1">Key Strengths Found in Answer:</span>
                    <ul className="space-y-1 text-slate-700">
                      {currentEvaluation.strengths.length > 0 ? (
                        currentEvaluation.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic">No strong factual match with the ebook.</li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="font-bold text-amber-800 block mb-1">Areas for Improvement:</span>
                    <ul className="space-y-1 text-slate-700">
                      {currentEvaluation.improvements.length > 0 ? (
                        currentEvaluation.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{imp}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic">Answer was comprehensive according to the text.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Follow-up Action or Next Question */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {currentEvaluation.followUpQuestion && followUpCount < 2 ? (
                    <button
                      type="button"
                      onClick={handleProceedToFollowUp}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0a2540] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <span>Answer Follow-Up Question ({followUpCount + 1}/2)</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  ) : (
                    <div className="text-xs text-slate-500">
                      {followUpCount >= 2 ? "Maximum 2 follow-ups reached for this topic." : "Topic completed."}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fetchNextQuestion(currentQuestion.chunkId)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0a2540] hover:bg-[#071b30] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span>Next Practice Question</span>
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>SBI PO AI Interview Coach • Practice Banking Awareness from BBM PRO 2026 Ebook</p>
      </footer>
    </div>
  );
}
