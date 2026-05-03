"use client";

import { useState } from "react";
import { RiskMatrixParams } from "@/lib/types";

interface Props {
  params: RiskMatrixParams;
}

const ZONE_COLOR = (prob: number, impact: number) => {
  const score = prob * impact;
  if (score >= 15) return { bg: "rgba(230,60,58,0.25)", border: "rgba(230,60,58,0.5)", label: "Critical" };
  if (score >= 9) return { bg: "rgba(251,146,60,0.20)", border: "rgba(251,146,60,0.45)", label: "High" };
  if (score >= 4) return { bg: "rgba(250,204,21,0.15)", border: "rgba(250,204,21,0.35)", label: "Medium" };
  return { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.3)", label: "Low" };
};

const RISK_COLORS = ["#E63C3A", "#38bdf8", "#4ade80", "#a78bfa", "#fb923c"];

export default function RiskMatrixChart({ params }: Props) {
  const [risks, setRisks] = useState(params.risks);
  const [selected, setSelected] = useState(0);

  const updateRisk = (idx: number, field: "probability" | "impact", val: number) => {
    setRisks((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  };

  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => ({
      prob: col + 1,
      impact: 5 - row,
    }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Risk Matrix
        </h3>
        <div className="flex gap-3 text-xs">
          {["Low", "Medium", "High", "Critical"].map((l, i) => {
            const colors = ["text-emerald-400", "text-yellow-400", "text-orange-400", "text-brand"];
            return <span key={l} className={colors[i]}>{l}</span>;
          })}
        </div>
      </div>

      {/* 5×5 grid */}
      <div className="relative">
        <div className="text-[9px] text-neutral-600 text-center mb-1 tracking-widest uppercase">Probability →</div>
        <div className="flex gap-1">
          {/* Y-axis label */}
          <div className="flex flex-col items-center justify-center w-4 shrink-0">
            <span className="text-[9px] text-neutral-600 uppercase tracking-widest"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              Impact ↑
            </span>
          </div>
          {/* Grid */}
          <div className="flex-1">
            {grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1 mb-1">
                {row.map(({ prob, impact }) => {
                  const zone = ZONE_COLOR(prob, impact);
                  const risksHere = risks.filter(
                    (r) => Math.round(r.probability) === prob && Math.round(r.impact) === impact
                  );
                  return (
                    <div
                      key={`${prob}-${impact}`}
                      className="flex-1 h-8 rounded flex items-center justify-center gap-0.5 text-[8px] font-bold"
                      style={{ background: zone.bg, border: `1px solid ${zone.border}` }}
                    >
                      {risksHere.map((r, i) => {
                        const ri = risks.indexOf(r);
                        return (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold cursor-pointer"
                            style={{ background: RISK_COLORS[ri % RISK_COLORS.length] }}
                            onClick={() => setSelected(ri)}
                            title={r.name}
                          >
                            {ri + 1}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
            {/* X-axis labels */}
            <div className="flex gap-1">
              <div className="w-4" />
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex-1 text-center text-[9px] text-neutral-700">{n}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk legend */}
      <div className="flex flex-wrap gap-2">
        {risks.map((r, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all ${
              selected === i ? "bg-white/[0.08] border border-white/[0.15]" : "bg-white/[0.03] border border-white/[0.06]"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: RISK_COLORS[i % RISK_COLORS.length] }}
            />
            <span className="text-neutral-400">{i + 1}. {r.name}</span>
          </button>
        ))}
      </div>

      {/* Sliders for selected risk */}
      <div className="space-y-2.5 pt-2 border-t border-white/10">
        <div className="text-xs text-neutral-500 font-medium">
          Editing: <span style={{ color: RISK_COLORS[selected % RISK_COLORS.length] }}>{risks[selected]?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-24 shrink-0">Probability</span>
          <input type="range" min={1} max={5} step={1} value={risks[selected]?.probability ?? 1}
            onChange={(e) => updateRisk(selected, "probability", Number(e.target.value))}
            className="flex-1 accent-red-500" />
          <span className="text-xs font-mono text-red-400 w-6 text-right">{risks[selected]?.probability}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-24 shrink-0">Impact</span>
          <input type="range" min={1} max={5} step={1} value={risks[selected]?.impact ?? 1}
            onChange={(e) => updateRisk(selected, "impact", Number(e.target.value))}
            className="flex-1 accent-red-500" />
          <span className="text-xs font-mono text-red-400 w-6 text-right">{risks[selected]?.impact}</span>
        </div>
      </div>
    </div>
  );
}
