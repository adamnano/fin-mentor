"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/lib/types";

interface Props {
  question: Question | null;
  isGenerating: boolean;
  selectedAnswer: "A" | "B" | "C" | null;
  hasAnswered: boolean;
  onSelectAnswer: (answer: "A" | "B" | "C") => void;
  onSubmit: (answer: "A" | "B" | "C", timeSpent: number) => void;
  onNext: () => void;
}

const CHOICE_LABELS = ["A", "B", "C"] as const;

function choiceText(q: Question, choice: "A" | "B" | "C"): string {
  return choice === "A" ? q.choiceA : choice === "B" ? q.choiceB : q.choiceC;
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="flex gap-2">
        <div className="h-5 w-24 bg-white/[0.06] rounded-full" />
        <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
      </div>
      <div className="space-y-2.5">
        <div className="h-3.5 bg-white/[0.06] rounded w-full" />
        <div className="h-3.5 bg-white/[0.06] rounded w-5/6" />
        <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
      </div>
      <div className="space-y-2 pt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 bg-white/[0.04] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function QuestionCard({
  question,
  isGenerating,
  selectedAnswer,
  hasAnswered,
  onSelectAnswer,
  onSubmit,
  onNext,
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (!question || hasAnswered) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [question?.questionText, hasAnswered]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!question || isGenerating) return;
    const handleKey = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (!hasAnswered) {
        if (e.key === "1" || e.key === "a" || e.key === "A") onSelectAnswer("A");
        if (e.key === "2" || e.key === "b" || e.key === "B") onSelectAnswer("B");
        if (e.key === "3" || e.key === "c" || e.key === "C") onSelectAnswer("C");
        if (e.key === "Enter" && selectedAnswer) onSubmit(selectedAnswer, elapsed);
      } else {
        if (e.key === "Enter" || e.key === "n" || e.key === "N") onNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [question, isGenerating, hasAnswered, selectedAnswer, elapsed, onSelectAnswer, onSubmit, onNext]);

  if (isGenerating || !question) {
    return (
      <div className="card p-4 md:p-7 min-h-[280px]">
        <SkeletonLoader />
      </div>
    );
  }

  const isCorrect = hasAnswered && selectedAnswer === question.correctAnswer;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.questionText}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="card card-hover p-4 md:p-7"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-muted border border-brand-border text-brand text-xs font-semibold tracking-wide">
              {question.category}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-neutral-500 text-xs">
              Level {question.level}
            </span>
            {Array.from({ length: question.difficulty }).map((_, i) => (
              <span key={i} className="text-brand text-xs leading-none">★</span>
            ))}
            {Array.from({ length: Math.max(0, 3 - question.difficulty) }).map((_, i) => (
              <span key={i} className="text-neutral-700 text-xs leading-none">★</span>
            ))}
            {question.source === "ai" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.05] text-neutral-600 text-xs border border-white/[0.06]">
                AI
              </span>
            )}
          </div>

          {!hasAnswered ? (
            <span className="text-xs font-mono text-neutral-600 tabular-nums">
              {Math.floor(elapsed / 60).toString().padStart(2, "0")}:
              {(elapsed % 60).toString().padStart(2, "0")}
            </span>
          ) : (
            <span
              className={`text-sm font-semibold tracking-tight px-3 py-1 rounded-full ${
                isCorrect
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-red-500/12 text-red-400 border border-red-500/20"
              }`}
            >
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </span>
          )}
        </div>

        {/* Question */}
        <p className="text-white text-[15px] leading-relaxed mb-5 font-normal">
          {question.questionText}
        </p>

        {/* Choices */}
        <div className="space-y-2 mb-5">
          {CHOICE_LABELS.map((label) => {
            const text = choiceText(question, label);
            const isSelected = selectedAnswer === label;
            const isRight = hasAnswered && label === question.correctAnswer;
            const isWrong = hasAnswered && isSelected && label !== question.correctAnswer;

            let outerCls =
              "w-full flex items-start gap-3.5 p-3.5 rounded-2xl border text-left text-sm transition-all duration-200 ";

            if (!hasAnswered) {
              outerCls += isSelected
                ? "border-brand bg-brand-muted text-white"
                : "border-white/[0.07] bg-white/[0.03] text-neutral-400 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-neutral-200 cursor-pointer";
            } else if (isRight) {
              outerCls += "border-emerald-500/40 bg-emerald-500/10 text-white";
            } else if (isWrong) {
              outerCls += "border-red-500/35 bg-red-500/10 text-white";
            } else {
              outerCls += "border-white/[0.04] bg-transparent text-neutral-700 opacity-35";
            }

            return (
              <button
                key={label}
                className={outerCls}
                onClick={() => !hasAnswered && onSelectAnswer(label)}
                disabled={hasAnswered}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                    isRight
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                      : isWrong
                      ? "border-red-400 bg-red-500/10 text-red-400"
                      : isSelected
                      ? "border-brand bg-brand/15 text-brand"
                      : "border-neutral-700 text-neutral-600"
                  }`}
                >
                  {label}
                </span>
                <span className="flex-1 text-[13px] leading-relaxed">{text}</span>
              </button>
            );
          })}
        </div>

        {/* Keyboard hint */}
        {!hasAnswered && (
          <p className="text-[10px] text-neutral-700 mb-4">
            Press <kbd className="font-mono bg-white/[0.06] px-1 py-0.5 rounded text-neutral-600">1–3</kbd> to select · <kbd className="font-mono bg-white/[0.06] px-1 py-0.5 rounded text-neutral-600">Enter</kbd> to submit
          </p>
        )}

        {/* Action */}
        {!hasAnswered ? (
          <button
            onClick={() => selectedAnswer && onSubmit(selectedAnswer, elapsed)}
            disabled={!selectedAnswer}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed bg-brand text-white hover:bg-brand-light active:scale-[0.99] shadow-md shadow-brand/25"
          >
            Submit Answer
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border ${isCorrect ? "bg-emerald-500/8 border-emerald-500/20" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <p className="text-[10px] font-semibold text-brand uppercase tracking-widest mb-2">
                Explanation
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed">{question.explanation}</p>
            </div>
            <button
              onClick={onNext}
              className="w-full py-3 rounded-2xl font-semibold text-sm bg-white/[0.06] text-neutral-300 hover:bg-white/[0.09] hover:text-white transition-all duration-200 border border-white/[0.07] active:scale-[0.99]"
            >
              Next Question <span className="text-neutral-600 text-xs">(N)</span>
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
