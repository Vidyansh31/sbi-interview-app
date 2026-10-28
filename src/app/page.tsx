"use client";

import { useState } from "react";
import {
  InterviewDifficulty,
  InterviewMode,
  TimeWindow,
  CurrentAffairsCategory,
} from "@/lib/currentAffairsTypes";

import { useRouter } from "next/navigation";
import Link from "next/link";

const CA_CATEGORIES: CurrentAffairsCategory[] = [
  "Banking and RBI",
  "Indian economy and budget",
  "National affairs",
  "International affairs",
  "Government schemes and policies",
  "Appointments, awards, sports, reports, and major events",
];

export default function Home() {
  const router = useRouter();

  // Practice configuration state
  const [selectedMode, setSelectedMode] = useState<InterviewMode>("full_mock");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("moderate");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("6_months");
  const [selectedCategories, setSelectedCategories] = useState<CurrentAffairsCategory[]>([
    "Banking and RBI",
    "Indian economy and budget",
    "Government schemes and policies",
  ]);

  const toggleCategory = (cat: CurrentAffairsCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
    );
  };

  const startInterview = () => {
    const params = new URLSearchParams();
    // Unique session ID generated at user interaction time to guarantee fresh state
    params.set("sid", Date.now().toString());

    if (selectedMode === "full_mock") {
      params.set("mode", "full_mock");
      params.set("difficulty", difficulty);
      router.push(`/interview?${params.toString()}`);
      return;
    }

    params.set("mode", "current_affairs");
    params.set("difficulty", difficulty);
    params.set("timeWindow", timeWindow);
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }
    router.push(`/interview?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Notification Bar */}
      <div className="bg-[#071b30] text-slate-200 text-xs sm:text-sm py-2 px-4 border-b border-[#122e50]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium text-amber-300">Dedicated Platform for SBI PO Aspirants</span>
            <span className="hidden md:inline text-slate-400">• Updated for 2024–2026 Interview Cycle</span>
          </div>
          <span className="font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 rounded text-xs">
            100% Free Access
          </span>
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between"
          aria-label="Main Navigation"
        >
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-hidden focus:ring-2 focus:ring-[#0a2540] rounded-lg p-1">
            <div className="w-10 h-10 rounded-lg bg-[#0a2540] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-[#071b30] transition-colors">
              <svg
                className="w-6 h-6 text-amber-400"
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
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#0a2540] tracking-tight leading-tight">
                SBI PO <span className="text-amber-600 font-extrabold">Interview Coach</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">
                AI Preparation Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className="text-sm font-semibold text-[#0a2540] hover:text-amber-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/banking-awareness"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Banking Awareness (PDF)</span>
            </Link>
            <a
              href="#practice"
              className="text-sm font-medium text-slate-600 hover:text-[#0a2540] transition-colors"
            >
              Mock Formats
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-[#0a2540] transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <a
              href="#practice"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0a2540] hover:bg-[#071b30] rounded-lg shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#0a2540]"
            >
              <span>Start Interview</span>
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200/80 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Copy & CTA */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-medium mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-amber-600" />
                  <span>State Bank of India Probationary Officer Phase-III Prep</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0a2540] tracking-tight leading-[1.15] mb-6">
                  Your SBI PO Interview Journey{" "}
                  <span className="relative whitespace-nowrap">
                    <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#0a2540] via-[#123e6b] to-amber-600">
                      Starts Here
                    </span>
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-700 leading-relaxed mb-8 max-w-2xl">
                  Candidates can practise realistic AI-powered SBI PO interviews and receive personalised feedback for free. Master banking concepts, current RBI policies, and panel cross-questioning with confidence.
                </p>

                {/* Primary & Secondary Actions - Distinct, Professional Layout */}
                <div className="w-full flex flex-col gap-3.5 mb-8">
                  {/* Primary CTA Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={startInterview}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-[#0a2540] hover:bg-[#071b30] rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2 cursor-pointer"
                    >
                      <span>Start Mock Interview</span>
                      <svg
                        className="w-4 h-4 text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>

                    {/* Dedicated Practice Banking Awareness Button */}
                    <Link
                      href="/banking-awareness"
                      className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-bold text-[#0a2540] bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 border border-amber-500/30 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5 text-[#0a2540] transition-transform group-hover:scale-110"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Practice Banking Awareness</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#0a2540] text-amber-300 px-2 py-0.5 rounded-full ml-1">
                        Ebook PDF
                      </span>
                    </Link>
                  </div>

                  {/* Secondary Configure Link */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <span>Or calibrate your interview:</span>
                    <a
                      href="#practice"
                      className="font-semibold text-[#0a2540] hover:text-amber-600 underline decoration-slate-300 hover:decoration-amber-600 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Configure Formats &amp; Difficulty</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Trust Points */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 w-full text-slate-600 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>100% Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Voice &amp; Text Practice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>No Login Required</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Panel Preview Card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative glow */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400 to-[#0a2540] opacity-20 blur-xl" />

                  <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 space-y-5">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0a2540]">
                          Live Panel Simulation Preview
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Phase III Panel
                      </span>
                    </div>

                    {/* Question Bubble */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          General Manager (Interview Panel)
                        </span>
                        <span className="text-[11px] font-mono text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                          Question 03/10
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        &ldquo;How does the RBI&apos;s stance on Repo Rate transmission impact SBI&apos;s Net Interest Margin (NIM) in an inflationary market?&rdquo;
                      </p>
                    </div>

                    {/* Candidate Answer Bubble */}
                    <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Your Response:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        &ldquo;Repo rate revisions adjust the External Benchmark Lending Rate (EBLR). For SBI, deposits reprice with a lag while floating loans reprice immediately...&rdquo;
                      </p>
                    </div>

                    {/* AI Feedback Badge */}
                    <div className="bg-white border border-amber-200 rounded-xl p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          AI Assessment &amp; Coaching
                        </span>
                      </div>
                      <ul className="text-xs space-y-1.5 text-slate-700">
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span><strong>Banking Accuracy:</strong> Correctly linked EBLR and liability repricing lag.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-700 font-bold">⚡</span>
                          <span><strong>Key Follow-up:</strong> Be prepared to explain CASA ratio impact next.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERVIEW PRACTICE CONFIGURATION SECTION ── */}
        <section id="practice" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                Customized Interview Modes
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#0a2540] tracking-tight">
                Select Your Interview Experience
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Choose between a comprehensive 10-question Full Mock Panel, dedicated Current Affairs, or specialized PDF Banking Awareness.
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10">
              {/* Step 1: Mode Selection - 3 Cards */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Step 1: Choose Interview Format
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mode Card 1: Full Mock */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode("full_mock")}
                    className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedMode === "full_mock"
                        ? "border-[#0a2540] bg-[#0a2540]/5 ring-2 ring-[#0a2540]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base text-[#0a2540]">Full Mock Interview</span>
                      {selectedMode === "full_mock" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0a2540]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Complete 10-question panel simulation spanning Bio-Data, Banking &amp; RBI, SBI &amp; Digital Banking, Situational Judgment, and Current Affairs.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                      <span>Standard SBI Phase-III Board</span>
                    </div>
                  </button>

                  {/* Mode Card 2: Current Affairs Only */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode("current_affairs")}
                    className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedMode === "current_affairs"
                        ? "border-[#0a2540] bg-[#0a2540]/5 ring-2 ring-[#0a2540]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base text-[#0a2540]">Dedicated Current Affairs</span>
                      {selectedMode === "current_affairs" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0a2540]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      10 questions 100% grounded in verified official news (RBI circulars, Ministry of Finance, PIB). Zero generic HR questions.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
                      <span>Verifiable facts with sources</span>
                    </div>
                  </button>

                  {/* Mode Card 3: Banking Awareness (Direct Link to PDF Practice) */}
                  <Link
                    href="/banking-awareness"
                    className="text-left p-5 rounded-2xl border-2 border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-[#0a2540]">Banking Awareness</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-[#0a2540] px-2 py-0.5 rounded-full">
                          PDF Ebook
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Practice questions derived exclusively from <strong>BBM PRO 2026 Ebook.pdf</strong> with strict zero-hallucination evaluation.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-800 group-hover:text-amber-900">
                      <span>Open Ebook Practice</span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Step 2: Difficulty Selection */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Step 2: Calibrate Difficulty
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Easy */}
                  <button
                    type="button"
                    onClick={() => setDifficulty("easy")}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      difficulty === "easy"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Easy</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Foundational questions, core banking definitions, gentle follow-ups.
                    </p>
                  </button>

                  {/* Moderate */}
                  <button
                    type="button"
                    onClick={() => setDifficulty("moderate")}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      difficulty === "moderate"
                        ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] ring-1 ring-[#0a2540]"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Moderate (Recommended)</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Balanced mix of conceptual rigor, current policy applications, and panel counter-questions.
                    </p>
                  </button>

                  {/* Hard */}
                  <button
                    type="button"
                    onClick={() => setDifficulty("hard")}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      difficulty === "hard"
                        ? "border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-500"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Hard</span>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Complex situational trade-offs, advanced monetary mechanisms, intense stress cross-examination.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: Current Affairs Options (Conditional) */}
              {selectedMode === "current_affairs" && (
                <div className="mb-8 space-y-6 pt-6 border-t border-slate-200">
                  {/* Time Window */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Time Window for Current Affairs
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { id: "3_months", label: "Past 3 Months" },
                          { id: "6_months", label: "Past 6 Months" },
                          { id: "12_months", label: "Past 12 Months" },
                        ] as const
                      ).map((tw) => (
                        <button
                          key={tw.id}
                          type="button"
                          onClick={() => setTimeWindow(tw.id)}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            timeWindow === tw.id
                              ? "bg-[#0a2540] text-white border-[#0a2540]"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {tw.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Focus Topics (Select at least one)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CA_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-50/70 border-amber-300 text-amber-950 font-semibold"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                isSelected
                                  ? "bg-amber-600 border-amber-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && "✓"}
                            </span>
                            <span className="leading-snug">{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Start Interview Action */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 text-center sm:text-left">
                  <p>
                    Session: <strong>{selectedMode === "full_mock" ? "10 Questions Comprehensive Mock" : "10 Questions Dedicated Current Affairs"}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Includes real-time voice speech, feedback dossier, and downloadable PDF report.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startInterview}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#0a2540] hover:bg-[#071b30] rounded-xl shadow-md transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2 cursor-pointer"
                >
                  <span>Launch Interview Session</span>
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                Phase-III SBI PO Alignment
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#0a2540]">
                Everything You Need to Clear Phase-III
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                Developed specifically for SBI PO interview aspirants to practice anytime, anywhere.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-[#0a2540] mb-2">
                  Multi-Turn Panel Follow-Ups
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real SBI PO interview panels cross-question your claims. The AI generates contextual counter-questions dynamically tailored to your answers.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-[#0a2540] mb-2">
                  Strict PDF Grounding (BBM PRO 2026)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Practice specialized banking awareness questions generated directly from your 356-page BBM PRO 2026 Ebook with zero hallucination.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-[#0a2540] mb-2">
                  Detailed PDF Report Dossier
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download an official evaluation report compiling every question asked, your responses, model answers, and examiner feedback.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            SBI PO AI Interview Coach • Dedicated Preparation Platform
          </p>
          <p>
            Designed exclusively for SBI Probationary Officer aspirants. Strictly grounded AI simulations.
          </p>
        </div>
      </footer>
    </div>
  );
}
