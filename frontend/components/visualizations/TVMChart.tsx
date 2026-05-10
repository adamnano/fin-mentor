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
} from "recharts";
import { TVMParams } from "@/lib/types";

interface Props {
  params: TVMParams;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function TVMChart({ params }: Props) {
  const [principal, setPrincipal] = useState(params.principal);
  const [rate, setRate] = useState(params.rate);
  const [periods, setPeriods] = useState(params.periods);

  const data = useMemo(() => {
    return Array.from({ length: periods + 1 }, (_, i) => ({
      year: i,
      value: Math.round(principal * Math.pow(1 + rate, i)),
      simple: Math.round(principal * (1 + rate * i)),
    }));
  }, [principal, rate, periods]);

  const finalFV = data[data.length - 1]?.value ?? 0;
  const totalInterest = finalFV - principal;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand uppercase tracking-wider">
          Time Value of Money
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{formatCurrency(finalFV)}</div>
          <div className="text-xs text-neutral-600">
            Future Value · +{formatCurrency(totalInterest)} interest
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            label={{ value: "Years", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
            labelFormatter={(l) => `Year ${l}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any, name: any) => [
              formatCurrency(v as number),
              name === "value" ? "Compound" : "Simple",
            ]}
          />
          <Line
            type="monotone"
            dataKey="simple"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#E63C3A"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-neutral-600">
        <span className="flex items-center gap-1">
          <span className="inline-block w-6 h-0.5 bg-brand" /> Compound
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-6 h-0.5 bg-neutral-700 border-dashed border-t border-neutral-700" /> Simple
        </span>
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        {/* Principal Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-20 shrink-0">Principal</span>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="flex-1 accent-red-500"
          />
          <span className="text-xs font-mono text-red-400 w-16 text-right">
            {formatCurrency(principal)}
          </span>
        </div>

        {/* Rate Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-20 shrink-0">Rate / yr</span>
          <input
            type="range"
            min={0.01}
            max={0.25}
            step={0.005}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="flex-1 accent-red-500"
          />
          <span className="text-xs font-mono text-red-400 w-16 text-right">
            {(rate * 100).toFixed(1)}%
          </span>
        </div>

        {/* Periods Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-20 shrink-0">Years</span>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={periods}
            onChange={(e) => setPeriods(Number(e.target.value))}
            className="flex-1 accent-red-500"
          />
          <span className="text-xs font-mono text-red-400 w-16 text-right">
            {periods} yr
          </span>
        </div>
      </div>
    </div>
  );
}
