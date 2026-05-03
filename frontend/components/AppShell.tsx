"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/hooks/useAppState";
import { CategoryScore, CFACategory, CFALevel } from "@/lib/types";
import Sidebar from "./Sidebar";
import QuestionCard from "./QuestionCard";
import FlashCard from "./FlashCard";
import NewsPanel from "./NewsPanel";
import VisualizationPanel from "./VisualizationPanel";
import ChatPanel from "./ChatPanel";

interface Props {
  initialScores: CategoryScore[];
}

export default function AppShell({ initialScores }: Props) {
  const { state, dispatch, fetchQuestion, submitAnswer } = useAppState(initialScores);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.isDarkMode]);

  useEffect(() => {
    fetchQuestion(state.selectedCategories, state.selectedLevel, state.useAI);
  }, []);

  // Demo mode auto-cycle
  useEffect(() => {
    if (!state.isDemoMode) {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
      return;
    }

    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);

    if (!state.currentQuestion || state.isGenerating) return;

    if (!state.hasAnswered) {
      // Auto-select correct answer after 3s
      demoTimerRef.current = setTimeout(() => {
        if (state.currentQuestion) {
          dispatch({ type: "SELECT_ANSWER", answer: state.currentQuestion.correctAnswer });
          // Submit 1.5s later
          setTimeout(() => {
            if (state.currentQuestion) {
              const elapsed = Math.round((Date.now() - state.questionStartTime) / 1000);
              submitAnswer(state.currentQuestion.correctAnswer, state.currentQuestion, elapsed);
            }
          }, 1500);
        }
      }, 3000);
    } else {
      // Move to next question after 5s
      demoTimerRef.current = setTimeout(() => {
        fetchQuestion(state.selectedCategories, state.selectedLevel, state.useAI);
      }, 5000);
    }

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, [state.isDemoMode, state.hasAnswered, state.currentQuestion?.questionText, state.isGenerating]);

  const handleSubmit = (answer: "A" | "B" | "C", timeSpent: number) => {
    if (!state.currentQuestion) return;
    dispatch({ type: "SELECT_ANSWER", answer });
    submitAnswer(answer, state.currentQuestion, timeSpent);
  };

  const handleNext = () => {
    fetchQuestion(state.selectedCategories, state.selectedLevel, state.useAI);
  };

  const q = state.currentQuestion;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Left Sidebar */}
      <div
        className={`shrink-0 border-r border-white/[0.06] bg-surface-1 overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "w-80" : "w-0"
        }`}
      >
        <Sidebar
          scores={state.scores}
          selectedCategories={state.selectedCategories}
          selectedLevel={state.selectedLevel}
          useAI={state.useAI}
          onToggleCategory={(cat: CFACategory) => dispatch({ type: "TOGGLE_CATEGORY", category: cat })}
          onSetAllCategories={(sel: boolean) => dispatch({ type: "SET_ALL_CATEGORIES", selected: sel })}
          onSetLevel={(lvl: CFALevel) => dispatch({ type: "SET_LEVEL", level: lvl })}
          onToggleAI={() => dispatch({ type: "TOGGLE_AI" })}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-surface-1">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex flex-col items-center justify-center gap-1.5 w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle sidebar"
            >
              <span className="w-4 h-px bg-neutral-400 rounded-full" />
              <span className="w-4 h-px bg-neutral-400 rounded-full" />
              <span className="w-4 h-px bg-neutral-400 rounded-full" />
            </button>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">
                {q ? (
                  <>
                    <span className="text-brand">{q.category}</span>
                    <span className="text-neutral-600 mx-2">·</span>
                    <span className="text-neutral-400">Level {q.level}</span>
                  </>
                ) : (
                  <span className="text-neutral-500">Loading...</span>
                )}
              </p>
              <p className="text-xs text-neutral-600 mt-0.5 tracking-wide">
                AI-powered adaptive training for financial professionals
              </p>
            </div>
          </div>

          {/* Header controls */}
          <div className="flex items-center gap-3">
            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1 border border-white/[0.07]">
              {([["mcq", "MCQ"], ["flashcard", "Flashcard"], ["news", "📰 News"]] as const).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => dispatch({ type: "SET_MODE", mode: m as "mcq" | "flashcard" | "news" })}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-150 ${
                    state.mode === m
                      ? "bg-brand text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Demo mode toggle */}
            <button
              onClick={() => dispatch({ type: "TOGGLE_DEMO_MODE" })}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-150 border ${
                state.isDemoMode
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-white/[0.04] border-white/[0.08] text-neutral-600 hover:text-neutral-400"
              }`}
              title="Exhibition demo mode — auto-cycles questions"
            >
              {state.isDemoMode ? "● Demo" : "Demo"}
            </button>

            {/* About link */}
            <Link
              href="/about"
              className="px-3 py-1.5 text-xs rounded-lg font-medium bg-white/[0.04] border border-white/[0.08] text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.07] transition-all duration-150"
            >
              About
            </Link>

            <button
              onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.05] transition-all"
              title={state.isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {state.isDarkMode ? (
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3Zm0 2a7 7 0 0 1 0 14A7 7 0 0 1 12 5Zm0 1a6 6 0 1 0 0 12A6 6 0 0 0 12 6Zm0 1.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              ) : (
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Demo mode banner */}
        {state.isDemoMode && (
          <div className="shrink-0 flex items-center gap-3 px-6 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-amber-400 font-medium">
              Exhibition Demo Mode — questions auto-cycle every ~10 seconds. Click Demo to stop.
            </p>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Question / Flashcard / News */}
          {state.mode === "mcq" && (
            <QuestionCard
              question={state.currentQuestion}
              isGenerating={state.isGenerating}
              selectedAnswer={state.selectedAnswer}
              hasAnswered={state.hasAnswered}
              onSelectAnswer={(a) => dispatch({ type: "SELECT_ANSWER", answer: a })}
              onSubmit={handleSubmit}
              onNext={handleNext}
            />
          )}
          {state.mode === "flashcard" && (
            <FlashCard
              question={state.currentQuestion}
              isGenerating={state.isGenerating}
              onNext={handleNext}
            />
          )}
          {state.mode === "news" && <NewsPanel />}

          {/* Smart Study Path suggestion */}
          {state.studyPath && state.hasAnswered && state.mode === "mcq" && (
            <div className="card p-4 border border-brand/20 bg-brand-muted">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-white">Smart Study Suggestion</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Your weakest topic is{" "}
                      <span className="text-brand font-semibold">{state.studyPath.category}</span>
                      {" "}({state.studyPath.accuracy}% accuracy) — drill it next?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      dispatch({ type: "ACCEPT_STUDY_PATH", category: state.studyPath!.category });
                      fetchQuestion([state.studyPath!.category], state.selectedLevel, state.useAI);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-brand text-white hover:bg-brand-light transition-colors"
                  >
                    Yes, drill {state.studyPath.category.split(" ")[0]}
                  </button>
                  <button
                    onClick={() => dispatch({ type: "DISMISS_STUDY_PATH" })}
                    className="px-3 py-1.5 text-xs rounded-lg font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Visualization panel — only in MCQ / flashcard modes */}
          {state.mode !== "news" && (q || state.isGenerating) && (
            <div className="card card-hover p-5">
              <div className="min-h-[280px] flex flex-col justify-center">
                {state.isGenerating ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-white/[0.06] rounded w-28" />
                    <div className="h-36 bg-white/[0.04] rounded-xl" />
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-6 bg-white/[0.06] rounded" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <VisualizationPanel
                    type={q?.visualizationType ?? null}
                    params={q?.visualizationParams ?? null}
                    category={q?.category}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Chat Panel */}
      <div className="shrink-0 w-96 border-l border-white/[0.06] bg-surface-1 overflow-hidden flex flex-col">
        <ChatPanel
          question={state.currentQuestion}
          history={state.chatHistory}
          onAddMessage={(msg) => dispatch({ type: "ADD_CHAT_MESSAGE", message: msg })}
          onUpdateLastMessage={(content) => dispatch({ type: "UPDATE_LAST_CHAT", content })}
        />
      </div>
    </div>
  );
}
