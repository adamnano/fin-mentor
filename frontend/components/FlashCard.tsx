"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/lib/types";

interface Props {
  question: Question | null;
  isGenerating: boolean;
  onNext: () => void;
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-5 w-24 bg-white/[0.06] rounded-full" />
      <div className="space-y-2.5">
        <div className="h-4 bg-white/[0.06] rounded w-full" />
        <div className="h-4 bg-white/[0.06] rounded w-4/5" />
        <div className="h-4 bg-white/[0.06] rounded w-3/5" />
      </div>
    </div>
  );
}

export default function FlashCard({ question, isGenerating, onNext }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState({ known: 0, review: 0 });

  const handleFlip = () => setIsFlipped((v) => !v);

  const handleKnow = () => {
    setScore((s) => ({ ...s, known: s.known + 1 }));
    setIsFlipped(false);
    onNext();
  };

  const handleReview = () => {
    setScore((s) => ({ ...s, review: s.review + 1 }));
    setIsFlipped(false);
    onNext();
  };

  if (isGenerating || !question) {
    return (
      <div className="card p-7 min-h-[280px]">
        <SkeletonLoader />
      </div>
    );
  }

  const choiceMap = { A: question.choiceA, B: question.choiceB, C: question.choiceC };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.questionText + (isFlipped ? "-back" : "-front")}
        initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="card card-hover p-7 min-h-[280px] flex flex-col cursor-pointer select-none"
        onClick={!isFlipped ? handleFlip : undefined}
        style={{ perspective: "1000px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-muted border border-brand-border text-brand text-xs font-semibold tracking-wide">
              {question.category}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-neutral-500 text-xs">
              {isFlipped ? "Answer" : "Flashcard"}
            </span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-500">{score.known} ✓</span>
            <span className="text-neutral-600">·</span>
            <span className="text-brand">{score.review} ↺</span>
          </div>
        </div>

        {!isFlipped ? (
          /* Front */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
            <p className="text-white text-[15px] leading-relaxed font-normal">{question.questionText}</p>
            <div className="flex items-center gap-2 text-xs text-neutral-600 mt-2">
              <span className="w-6 h-px bg-neutral-800" />
              <span>tap to reveal answer</span>
              <span className="w-6 h-px bg-neutral-800" />
            </div>
          </div>
        ) : (
          /* Back */
          <div className="flex-1 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1.5">
                Correct Answer — {question.correctAnswer}
              </p>
              <p className="text-sm text-white font-medium">{choiceMap[question.correctAnswer]}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">Explanation</p>
              <p className="text-sm text-neutral-400 leading-relaxed">{question.explanation}</p>
            </div>
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleReview}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-muted border border-brand-border text-brand hover:bg-brand hover:text-white transition-all duration-200"
              >
                ↺ Review Again
              </button>
              <button
                onClick={handleKnow}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-200"
              >
                ✓ Got It
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
