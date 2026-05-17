"use client";

import { useState } from "react";
import Image from "next/image";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { CategoryScore, CFACategory, CFALevel, ALL_CATEGORIES } from "@/lib/types";

interface Props {
  scores: CategoryScore[];
  selectedCategories: CFACategory[];
  selectedLevel: CFALevel;
  useAI: boolean;
  onToggleCategory: (cat: CFACategory) => void;
  onSetAllCategories: (selected: boolean) => void;
  onSetLevel: (level: CFALevel) => void;
  onToggleAI: () => void;
}

const CATEGORY_ICONS: Record<CFACategory, string> = {
  TVM: "⏱",
  "Fixed Income": "📊",
  Derivatives: "📈",
  Economics: "🌐",
  FSA: "📋",
  "Portfolio Management": "💼",
  Ethics: "⚖️",
  Equity: "📉",
  "ESG & Sustainability": "🌱",
  "Risk Management": "🛡️",
  "Compliance & AML": "🔒",
};

const SHORT_NAME: Record<CFACategory, string> = {
  TVM: "TVM",
  "Fixed Income": "FI",
  Derivatives: "Deriv",
  Economics: "Econ",
  FSA: "FSA",
  "Portfolio Management": "Port",
  Ethics: "Ethics",
  Equity: "Equity",
  "ESG & Sustainability": "ESG",
  "Risk Management": "Risk",
  "Compliance & AML": "AML",
};

export default function Sidebar({
  scores,
  selectedCategories,
  selectedLevel,
  useAI,
  onToggleCategory,
  onSetAllCategories,
  onSetLevel,
  onToggleAI,
}: Props) {
  const [showRadar, setShowRadar] = useState(false);

  const scoreMap = new Map(
    scores.map((s) => [`${s.category}-${s.level}`, s])
  );

  const totalAttempts = scores.reduce(
    (sum, s) => sum + (s.totalAttempts ?? s.total_attempts ?? 0),
    0
  );
  const totalCorrect = scores.reduce(
    (sum, s) => sum + (s.correctCount ?? s.correct_count ?? 0),
    0
  );
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const radarData = ALL_CATEGORIES.map((cat) => {
    const score = scoreMap.get(`${cat}-${selectedLevel}`);
    const attempts = score?.totalAttempts ?? score?.total_attempts ?? 0;
    const correct = score?.correctCount ?? score?.correct_count ?? 0;
    return {
      subject: SHORT_NAME[cat],
      value: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
    };
  });

  const hasAnyScore = radarData.some((d) => d.value > 0);

  return (
    <aside className="flex flex-col h-full overflow-y-auto">
      {/* Branding */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md dark:shadow-black/40 border border-white/[0.08]">
            <Image
              src="/tabf-logo.png"
              alt="TABF"
              width={40}
              height={40}
              className="w-full h-full object-cover dark:brightness-100 brightness-90"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white tracking-tight leading-tight">TABF FinMentor</p>
            <p className="text-[10px] text-neutral-500 tracking-wide mt-0.5">Adaptive Finance Training · AI</p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-end justify-between mb-2.5">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
            Overall Score
          </p>
          <p className="text-2xl font-bold text-white tabular-nums">{overallPct}<span className="text-sm text-neutral-500 font-normal">%</span></p>
        </div>
        <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="text-[10px] text-neutral-600 mt-1.5">
          {totalCorrect} / {totalAttempts} correct
        </p>
      </div>

      {/* Progress Analytics — radar toggle */}
      {hasAnyScore && (
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Analytics</p>
            <button
              onClick={() => setShowRadar((v) => !v)}
              className="text-[10px] text-neutral-500 hover:text-brand transition-colors"
            >
              {showRadar ? "Hide" : "Show radar"}
            </button>
          </div>
          {showRadar && (
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: "#71717a" }}
                />
                <Radar
                  name="Accuracy"
                  dataKey="value"
                  stroke="#D97706"
                  fill="#D97706"
                  fillOpacity={0.18}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Level Selector */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-3">
          Exam Level
        </p>
        <div className="flex gap-2">
          {([1, 2, 3] as CFALevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => onSetLevel(lvl)}
              className={`flex-1 py-2 text-xs rounded-xl font-semibold tracking-wide transition-all duration-150 ${
                selectedLevel === lvl
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "bg-white/[0.05] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300"
              }`}
            >
              Level {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* AI Toggle */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">AI Generation</p>
            <p className="text-[10px] text-neutral-600 mt-0.5">
              {useAI ? "GPT-4.1 mini · Live" : "Question bank"}
            </p>
          </div>
          <button
            onClick={onToggleAI}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
              useAI ? "bg-brand" : "bg-white/[0.1]"
            }`}
          >
            <span
              className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                useAI ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Topics */}
      <div className="px-5 py-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Topics</p>
          <div className="flex gap-3 text-xs">
            <button
              onClick={() => onSetAllCategories(true)}
              className="text-neutral-500 hover:text-brand transition-colors"
            >
              All
            </button>
            <span className="text-neutral-700">·</span>
            <button
              onClick={() => onSetAllCategories(false)}
              className="text-neutral-500 hover:text-neutral-400 transition-colors"
            >
              None
            </button>
          </div>
        </div>

        <div className="space-y-0.5">
          {ALL_CATEGORIES.map((cat) => {
            const score = scoreMap.get(`${cat}-${selectedLevel}`);
            const attempts = score?.totalAttempts ?? score?.total_attempts ?? 0;
            const correct = score?.correctCount ?? score?.correct_count ?? 0;
            const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
            const isSelected = selectedCategories.includes(cat);

            const pctColor =
              pct === null ? "" : pct >= 70 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-brand";
            const barColor =
              pct === null ? "" : pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-brand";

            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`w-full text-left rounded-xl px-3 py-2 transition-all duration-150 group ${
                  isSelected
                    ? "bg-white/[0.05] border border-white/[0.08]"
                    : "border border-transparent opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm leading-none">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-xs font-medium text-neutral-300">{cat}</span>
                  </div>
                  {pct !== null && (
                    <span className={`text-xs font-bold tabular-nums ${pctColor}`}>
                      {pct}%
                    </span>
                  )}
                </div>
                {attempts > 0 && (
                  <div className="mt-1.5 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
