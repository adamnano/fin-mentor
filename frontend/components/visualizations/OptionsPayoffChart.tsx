"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { OptionsPayoffParams } from "@/lib/types";

interface Props {
  params: OptionsPayoffParams;
}

export default function OptionsPayoffChart({ params }: Props) {
  const [optionType, setOptionType] = useState<"call" | "put">(
    params.optionType === "call" ? "put" : "call"
  );
  const [minStock, maxStock] = params.stockRange;
  const range = maxStock - minStock;

  // Offset strike and premium from correct values
  const [strike, setStrike] = useState(() => {
    const mid = (minStock + maxStock) / 2;
    return params.strikePrice >= mid
      ? Math.round(minStock + range * 0.25)
      : Math.round(minStock + range * 0.75);
  });
  const [premium, setPremium] = useState(() =>
    params.premium > 7.5 ? 2 : 13
  );

  const data = useMemo(() => {
    return Array.from({ length: 61 }, (_, i) => {
      const stock = minStock + (i / 60) * range;
      const intrinsic =
        optionType === "call"
          ? Math.max(0, stock - strike)
          : Math.max(0, strike - stock);
      const profit = Math.round((intrinsic - premium) * 100) / 100;
      return {
        stock: Math.round(stock * 10) / 10,
        profit,
        zero: 0,
      };
    });
  }, [optionType, strike, premium, minStock, range]);

  const breakeven =
    optionType === "call" ? strike + premium : strike - premium;
  const maxProfit =
    optionType === "call" ? "Unlimited" : `$${(strike - premium).toFixed(2)}`;
  const maxLoss = `$${premium.toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Options Payoff Diagram
        </h3>
        <div className="flex gap-1.5">
          {(["call", "put"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setOptionType(t)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                optionType === t
                  ? "bg-brand text-white"
                  : "bg-white/[0.05] text-neutral-600 hover:bg-white/[0.08] hover:text-neutral-300"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-neutral-500">
        <span>B/E: <strong className="text-brand">${breakeven.toFixed(2)}</strong></span>
        <span>Max Loss: <strong className="text-red-400">{maxLoss}</strong></span>
        <span>Max Profit: <strong className="text-emerald-400">{maxProfit}</strong></span>
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="stock" stroke="#71717a" tick={{ fontSize: 11 }}
            label={{ value: "Stock Price ($)", position: "insideBottom", offset: -2, fill: "#71717a", fontSize: 11 }} />
          <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 12 }}
            labelFormatter={(l) => `Stock: $${l}`}
            formatter={(v: unknown) => [`$${(v as number).toFixed(2)}`, "Profit/Loss"]}
          />
          <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
          <ReferenceLine x={strike} stroke="#94a3b8" strokeDasharray="3 3"
            label={{ value: "Strike", fill: "#94a3b8", fontSize: 10 }} />
          <ReferenceLine x={breakeven} stroke="#E63C3A" strokeDasharray="3 3"
            label={{ value: "B/E", fill: "#E63C3A", fontSize: 10 }} />
          <Line type="monotone" dataKey="profit"
            stroke={optionType === "call" ? "#4ade80" : "#f87171"}
            strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="space-y-3 pt-3 border-t border-white/[0.07]">
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold">Adjust to explore</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 w-20 shrink-0">Strike</span>
          <input type="range" min={minStock + 2} max={maxStock - 2} step={1} value={strike}
            onChange={(e) => setStrike(Number(e.target.value))} className="flex-1" />
          <span className="text-xs font-mono text-brand w-14 text-right">${strike}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 w-20 shrink-0">Premium</span>
          <input type="range" min={0.5} max={15} step={0.5} value={premium}
            onChange={(e) => setPremium(Number(e.target.value))} className="flex-1" />
          <span className="text-xs font-mono text-brand w-14 text-right">${premium}</span>
        </div>
      </div>
    </div>
  );
}
