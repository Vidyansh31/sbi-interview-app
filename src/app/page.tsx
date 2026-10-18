"use client";

import { useState } from "react";
import {
  InterviewDifficulty,
  InterviewMode,
  TimeWindow,
  CurrentAffairsCategory,
} from "@/lib/currentAffairsTypes";

import { useRouter } from "next/navigation";

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
          <a href="#" className="flex items-center gap-3 group focus:outline-hidden focus:ring-2 focus:ring-[#0a2540] rounded-lg p-1">
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
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-semibold text-[#0a2540] hover:text-amber-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#practice"
              className="text-sm font-medium text-slate-600 hover:text-[#0a2540] transition-colors"
            >
              Practice
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-[#0a2540] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#free-access"
              className="text-sm font-medium text-slate-600 hover:text-[#0a2540] transition-colors"
            >
              Free Access
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

                {/* Primary & Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                  <button
                    type="button"
                    onClick={startInterview}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-white bg-[#0a2540] hover:bg-[#071b30] rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2 cursor-pointer"
                  >
                    <span>Start Mock Interview</span>
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                  <a
                    href="#practice"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#0a2540] bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  >
                    <span>Configure Modes</span>
                  </a>
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
                    <span>RBI & SBI Focused</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Instant Evaluation</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Realistic Mock Interview Showcase Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-xl overflow-hidden">
                  {/* Card Header Bar */}
                  <div className="bg-[#0a2540] px-5 py-3.5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold tracking-wide">Live Panel Simulation Preview</span>
                    </div>
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-mono">
                      Phase III Panel
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-5 bg-gradient-to-b from-slate-50/50 to-white">
                    {/* Simulated Panel Question */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                        <span className="uppercase tracking-wider text-[#0a2540]">General Manager (Interview Panel)</span>
                        <span className="text-amber-600 font-mono">Question 03/10</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        &ldquo;How does the RBI&apos;s stance on Repo Rate transmission impact SBI&apos;s Net Interest Margin (NIM) in an inflationary market?&rdquo;
                      </p>
                    </div>

                    {/* Simulated Candidate Input */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 block mb-1">Your Response:</span>
                      <p className="italic text-slate-600 line-clamp-2">
                        &ldquo;Repo rate revisions adjust the External Benchmark Lending Rate (EBLR). For SBI, deposits reprice with a lag while floating loans reprice immediately...&rdquo;
                      </p>
                    </div>

                    {/* Simulated Instant AI Feedback */}
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h2 className="text-xs font-bold text-amber-900 tracking-wide uppercase">
                          AI Assessment &amp; Coaching
                        </h2>
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
                Choose between a comprehensive 10-question Full Mock Panel or a dedicated deep-dive into verified Current Affairs.
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10">
              {/* Step 1: Mode Selection */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Step 1: Choose Interview Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mode Card 1: Full Mock */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode("full_mock")}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${
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
                      Complete 10-question panel simulation spanning Personal Bio-Data, Banking &amp; RBI, SBI &amp; Digital Banking, Situational Judgment, and Current Affairs.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                      <span>Standard SBI Phase-III Board</span>
                    </div>
                  </button>

                  {/* Mode Card 2: Current Affairs Only */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode("current_affairs")}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${
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
                      <span>Verifiable facts with sources &amp; dates</span>
                    </div>
                  </button>
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
                    className={`p-4 rounded-xl border text-left transition-all ${
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
                    className={`p-4 rounded-xl border text-left transition-all ${
                      difficulty === "moderate"
                        ? "border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Moderate (Standard)</span>
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Realistic panel standard. Requires structured reasoning and examples.
                    </p>
                  </button>

                  {/* Hard */}
                  <button
                    type="button"
                    onClick={() => setDifficulty("hard")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      difficulty === "hard"
                        ? "border-red-600 bg-red-50 text-red-950 ring-1 ring-red-500"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Hard</span>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Advanced policy analysis, deep cross-examinations, tough trade-offs.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3 (Only if Current Affairs Mode): Time Window & Category Filter */}
              {selectedMode === "current_affairs" && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-8 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Time Window (Relative to October 2026)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["3_months", "6_months", "12_months"] as TimeWindow[]).map((tw) => (
                        <button
                          key={tw}
                          type="button"
                          onClick={() => setTimeWindow(tw)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold text-center transition-all ${
                            timeWindow === tw
                              ? "bg-[#0a2540] text-white shadow-xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          Last {tw === "3_months" ? "3 Months" : tw === "6_months" ? "6 Months" : "12 Months"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Target Categories (Select at least 1)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CA_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? "bg-white border-[#0a2540] text-[#0a2540] font-bold shadow-2xs"
                                : "bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white"
                            }`}
                          >
                            <span>{cat}</span>
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                                isSelected ? "bg-[#0a2540] text-white" : "border border-slate-300"
                              }`}
                            >
                              {isSelected ? "✓" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Start Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Ready to launch: <strong className="text-slate-800">{selectedMode === "full_mock" ? "Full Mock Interview" : "Current Affairs Interview"}</strong> ({difficulty.toUpperCase()})
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

        {/* Features Section */}
        <section id="features" className="py-16 lg:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Core Capabilities
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#0a2540] tracking-tight">
                Engineered for SBI PO Panel Excellence
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600">
                Unlike generic mock interview platforms, our coach is specifically structured around the rigorous expectations of the State Bank of India interview board.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0a2540] text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                    Realistic Mock Interviews
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Simulate real interview board atmosphere with questions spanning your bio-data, academic background, career switch rationale, and situational judgment.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-600">
                  Panel-grade simulation
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0a2540] text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                    Personalised AI Feedback
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Receive clear, constructive breakdowns on your answer completeness, conceptual accuracy, banking terminology usage, and professional poise.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-600">
                  Comprehensive rubric
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0a2540] text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                    Adaptive Follow-Ups
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Face realistic board cross-examinations. The AI analyzes your responses dynamically, challenging vague assumptions with at-most 2 targeted probes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-600">
                  Dynamic probing
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0a2540] text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                    Verified Current Affairs
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    100% verified events from RBI, Ministry of Finance, and NPCI. Rigorous questions grounded with verified publication dates and sources.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-600">
                  Official news grounding
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Preparation Workflow
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#0a2540] tracking-tight">
                Three Simple Steps to Success
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600">
                A seamless structured workflow designed to build your knowledge, composure, and communication step-by-step.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs relative flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#0a2540] text-amber-400 font-extrabold text-xl flex items-center justify-center mb-6 shadow-sm">
                  1
                </div>
                <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                  Answer questions
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Respond to curated questions designed by banking interview patterns. Tackle profile bio-data questions, banking awareness scenarios, and unexpected opinion prompts.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs relative flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#0a2540] text-amber-400 font-extrabold text-xl flex items-center justify-center mb-6 shadow-sm">
                  2
                </div>
                <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                  Receive feedback
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Get instant, impartial evaluations highlighting your strengths and identifying exact areas of improvement across technical accuracy, structure, and clarity.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs relative flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#0a2540] text-amber-400 font-extrabold text-xl flex items-center justify-center mb-6 shadow-sm">
                  3
                </div>
                <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                  Improve your performance
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Incorporate suggested corrections, review sample model answers, and practise repeatedly until answering with clarity becomes second nature.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Free for All Aspirants Section */}
        <section id="free-access" className="py-16 lg:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#0a2540] to-[#071b30] rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-6">
                  <span>Our Mission &amp; Promise</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
                  Completely Free for Every SBI PO Aspirant
                </h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                  Cracking the SBI PO exam requires tireless dedication across Prelims, Mains, and the Interview. We believe high-grade interview preparation should never be restricted behind prohibitive coaching fees or paid paywalls.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-700/80">
                  <div>
                    <h3 className="text-amber-400 font-bold text-lg mb-1">Zero Fees</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      No trial periods, no subscription upgrades, and no hidden costs.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-bold text-lg mb-1">Equal Opportunity</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Accessible for candidates across metro cities, towns, and rural India.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-bold text-lg mb-1">SBI Specific</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Tailored specifically to SBI PO patterns, not generic corporate HR.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 lg:py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-[#0a2540] tracking-tight mb-4">
              Begin Your SBI PO Mock Interview Now
            </h2>
            <p className="text-slate-600 text-base mb-8 max-w-xl mx-auto">
              Simulate 10 panel questions, practise speech responses, face adaptive follow-ups, and receive an instant Phase-III evaluation report.
            </p>
            <button
              type="button"
              onClick={startInterview}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#0a2540] hover:bg-[#071b30] rounded-xl shadow-md transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0a2540] focus:ring-offset-2 cursor-pointer"
            >
              <span>Start Free Mock Interview</span>
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SBI PO Interview Coach. Free educational platform.</p>
          <div className="flex items-center gap-6">
            <a href="#practice" className="hover:text-slate-800 transition-colors">
              Practice Modes
            </a>
            <a href="#how-it-works" className="hover:text-slate-800 transition-colors">
              How It Works
            </a>
            <a href="#free-access" className="hover:text-slate-800 transition-colors">
              Free Access
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
