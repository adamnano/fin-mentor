"use client";

import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ESGScoreParams } from "@/lib/types";

interface Props {
  params: ESGScoreParams;
}

function offsetScore(value: number): number {
  return value >= 50 ? Math.round(value * 0.35) : Math.round(Math.min(value * 2.5, 90));
}

export default function ESGScoreChart({ params }: Props) {
  const [env, setEnv] = useState(() => offsetScore(params.environmental));
  const [soc, setSoc] = useState(() => offsetScore(params.social));
  const [gov, setGov] = useState(() => offsetScore(params.governance));

  const data = [
    { subject: "Environmental", company: env, industry: params.industryEnv },
    { subject: "Social", company: soc, industry: params.industrySoc },
    { subject: "Governance", company: gov, industry: params.industryGov },
    { subject: "Disclosure", company: Math.round((env + gov) / 2), industry: Math.round((params.industryEnv + params.industryGov) / 2) },
    { subject: "Risk Mgmt", company: Math.round((soc + gov) / 2), industry: Math.round((params.industrySoc + params.industryGov) / 2) },
  ];

  const overallScore = Math.round((env + soc + gov) / 3);
  const scoreColor = overallScore >= 70 ? "#4ade80" : overallScore >= 50 ? "#fb923c" : "#f87171";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          ESG Score Analysis
        </h3>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color: scoreColor }}>
            {overallScore}<span className="text-xs text-neutral-600 ml-1">/ 100</span>
          </div>
          <div className="text-[10px] text-neutral-600">{params.companyName}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <RadarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#71717a" }} />
          <Radar name="Company" dataKey="company" stroke="#D97706" fill="#D97706" fillOpacity={0.22} strokeWidth={2} />
          <Radar name="Industry Avg" dataKey="industry" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="space-y-2.5 pt-3 border-t border-white/[0.07]">
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold">Adjust to explore</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 w-24 shrink-0">Environmental</span>
          <input type="range" min={0} max={100} step={5} value={env}
            onChange={(e) => setEnv(Number(e.target.value))} className="flex-1 accent-emerald-500" />
          <span className="text-xs font-mono text-emerald-400 w-8 text-right">{env}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-sky-400 w-24 shrink-0">Social</span>
          <input type="range" min={0} max={100} step={5} value={soc}
            onChange={(e) => setSoc(Number(e.target.value))} className="flex-1 accent-sky-500" />
          <span className="text-xs font-mono text-sky-400 w-8 text-right">{soc}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-violet-400 w-24 shrink-0">Governance</span>
          <input type="range" min={0} max={100} step={5} value={gov}
            onChange={(e) => setGov(Number(e.target.value))} className="flex-1 accent-violet-500" />
          <span className="text-xs font-mono text-violet-400 w-8 text-right">{gov}</span>
        </div>
      </div>
    </div>
  );
}
