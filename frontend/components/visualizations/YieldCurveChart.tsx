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
import { YieldCurveParams } from "@/lib/types";

interface Props {
  params: YieldCurveParams;
}

function bondPrice(parValue: number, couponRate: number, ytm: number, periods: number): number {
  const coupon = parValue * couponRate;
  let pv = 0;
  for (let t = 1; t <= periods; t++) {
    pv += coupon / Math.pow(1 + ytm, t);
  }
  pv += parValue / Math.pow(1 + ytm, periods);
  return Math.round(pv * 100) / 100;
}

function offsetRate(value: number, min: number, max: number): number {
  const mid = (min + max) / 2;
  return value >= mid ? min + (max - min) * 0.15 : min + (max - min) * 0.85;
}

export default function YieldCurveChart({ params }: Props) {
  const [couponRate, setCouponRate] = useState(() => Math.round(offsetRate(params.couponRate, 0.01, 0.15) * 1000) / 1000);
  const [ytm, setYtm] = useState(() => Math.round(offsetRate(params.ytm, 0.01, 0.20) * 1000) / 1000);
  const [periods, setPeriods] = useState(() => {
    const mid = (1 + 30) / 2;
    return params.periods >= mid ? 3 : 28;
  });
  const parValue = params.parValue;

  const currentPrice = useMemo(
    () => bondPrice(parValue, couponRate, ytm, periods),
    [parValue, couponRate, ytm, periods]
  );

  const data = useMemo(() => {
    return Array.from({ length: 41 }, (_, i) => {
      const y = 0.01 + i * 0.005;
      return {
        ytm: Math.round(y * 1000) / 10,
        price: bondPrice(parValue, couponRate, y, periods),
        par: parValue,
      };
    });
  }, [parValue, couponRate, periods]);

  const premium = currentPrice - parValue;
  const isDiscount = premium < 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Bond Price vs. YTM
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            ${currentPrice.toLocaleString()}
          </div>
          <div className={`text-xs ${isDiscount ? "text-red-400" : "text-emerald-400"}`}>
            {isDiscount ? "Discount" : "Premium"} · {isDiscount ? "" : "+"}
            ${Math.abs(Math.round(premium))} vs par
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="ytm" stroke="#71717a" tick={{ fontSize: 11 }}
            label={{ value: "YTM (%)", position: "insideBottom", offset: -2, fill: "#71717a", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`} />
          <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 12 }}
            labelFormatter={(l) => `YTM: ${l}%`}
            formatter={(v: unknown, name: unknown) => [
              `$${(v as number).toLocaleString()}`,
              name === "price" ? "Bond Price" : "Par Value",
            ]}
          />
          <ReferenceLine x={ytm * 100} stroke="#E63C3A" strokeDasharray="4 4"
            label={{ value: "Current YTM", fill: "#E63C3A", fontSize: 10 }} />
          <Line type="monotone" dataKey="par" stroke="#475569" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="space-y-3 pt-3 border-t border-white/[0.07]">
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold">Adjust to explore</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 w-24 shrink-0">Coupon Rate</span>
          <input type="range" min={0.01} max={0.15} step={0.005} value={couponRate}
            onChange={(e) => setCouponRate(Number(e.target.value))} className="flex-1" />
          <span className="text-xs font-mono text-brand w-14 text-right">{(couponRate * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 w-24 shrink-0">YTM</span>
          <input type="range" min={0.01} max={0.2} step={0.005} value={ytm}
            onChange={(e) => setYtm(Number(e.target.value))} className="flex-1" />
          <span className="text-xs font-mono text-brand w-14 text-right">{(ytm * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 w-24 shrink-0">Maturity</span>
          <input type="range" min={1} max={30} step={1} value={periods}
            onChange={(e) => setPeriods(Number(e.target.value))} className="flex-1" />
          <span className="text-xs font-mono text-brand w-14 text-right">{periods} yr</span>
        </div>
      </div>
    </div>
  );
}
