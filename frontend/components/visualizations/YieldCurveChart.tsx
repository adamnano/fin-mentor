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

export default function YieldCurveChart({ params }: Props) {
  const [couponRate, setCouponRate] = useState(params.couponRate);
  const [ytm, setYtm] = useState(params.ytm);
  const [periods, setPeriods] = useState(params.periods);
  const parValue = params.parValue;

  const currentPrice = useMemo(
    () => bondPrice(parValue, couponRate, ytm, periods),
    [parValue, couponRate, ytm, periods]
  );

  // Generate price vs YTM curve
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="ytm"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            label={{ value: "YTM (%)", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
            labelFormatter={(l) => `YTM: ${l}%`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any, name: any) => [
              `$${(v as number).toLocaleString()}`,
              name === "price" ? "Bond Price" : "Par Value",
            ]}
          />
          <ReferenceLine
            x={ytm * 100}
            stroke="#E63C3A"
            strokeDasharray="4 4"
            label={{ value: "Current YTM", fill: "#f5c842", fontSize: 10 }}
          />
          <Line type="monotone" dataKey="par" stroke="#475569" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-24 shrink-0">Coupon Rate</span>
          <input
            type="range" min={0.01} max={0.15} step={0.005} value={couponRate}
            onChange={(e) => setCouponRate(Number(e.target.value))}
            className="flex-1 accent-red-500"
          />
          <span className="text-xs font-mono text-red-400 w-14 text-right">
            {(couponRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-24 shrink-0">YTM</span>
          <input
            type="range" min={0.01} max={0.2} step={0.005} value={ytm}
            onChange={(e) => setYtm(Number(e.target.value))}
            className="flex-1 accent-red-500"
          />
          <span className="text-xs font-mono text-red-400 w-14 text-right">
            {(ytm * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-24 shrink-0">Maturity</span>
          <input
            type="range" min={1} max={30} step={1} value={periods}
            onChange={(e) => setPeriods(Number(e.target.value))}
            className="flex-1 accent-red-500"
          />
          <span className="text-xs font-mono text-red-400 w-14 text-right">
            {periods} yr
          </span>
        </div>
      </div>
    </div>
  );
}
