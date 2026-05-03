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
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import { SupplyDemandParams } from "@/lib/types";

interface Props {
  params: SupplyDemandParams;
}

export default function SupplyDemandChart({ params }: Props) {
  const [demandIntercept, setDemandIntercept] = useState(params.demandIntercept);
  const [supplyIntercept, setSupplyIntercept] = useState(params.supplyIntercept);
  const [demandSlope, setDemandSlope] = useState(params.demandSlope);
  const [supplySlope, setSupplySlope] = useState(params.supplySlope);

  const xLabel = params.xLabel ?? "Quantity";
  const yLabel = params.yLabel ?? "Price";

  // Equilibrium: D = S → demandIntercept + demandSlope*Q = supplyIntercept + supplySlope*Q
  // Q* = (demandIntercept - supplyIntercept) / (supplySlope - demandSlope)
  const equilibrium = useMemo(() => {
    const denom = supplySlope - demandSlope;
    if (Math.abs(denom) < 0.001) return null;
    const q = (demandIntercept - supplyIntercept) / denom;
    const p = supplyIntercept + supplySlope * q;
    return { q: Math.round(q * 10) / 10, p: Math.round(p * 10) / 10 };
  }, [demandIntercept, supplyIntercept, demandSlope, supplySlope]);

  const data = useMemo(() => {
    const points = 40;
    const maxQ = equilibrium ? equilibrium.q * 2.5 : 80;
    return Array.from({ length: points + 1 }, (_, i) => {
      const q = (i / points) * maxQ;
      const demand = demandIntercept + demandSlope * q;
      const supply = supplyIntercept + supplySlope * q;
      return {
        q: Math.round(q * 10) / 10,
        demand: demand > 0 ? Math.round(demand * 10) / 10 : null,
        supply: supply > 0 ? Math.round(supply * 10) / 10 : null,
      };
    });
  }, [demandIntercept, supplyIntercept, demandSlope, supplySlope, equilibrium]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Supply & Demand
        </h3>
        {equilibrium && (
          <div className="text-right text-xs">
            <span className="text-neutral-600">Equilibrium: </span>
            <span className="text-red-400 font-mono">
              Q*={equilibrium.q} · P*={equilibrium.p}
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="q"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            label={{ value: xLabel, position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }}
            label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
            labelFormatter={(l) => `${xLabel}: ${l}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any, name: any) => [v, name === "demand" ? "Demand" : "Supply"]}
          />
          {equilibrium && (
            <>
              <ReferenceLine x={equilibrium.q} stroke="#E63C3A" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine y={equilibrium.p} stroke="#E63C3A" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceDot x={equilibrium.q} y={equilibrium.p} r={5} fill="#E63C3A" stroke="#1a1a1a" />
            </>
          )}
          <Line type="monotone" dataKey="demand" stroke="#38bdf8" strokeWidth={2.5} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="supply" stroke="#4ade80" strokeWidth={2.5} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1 text-sky-400"><span className="w-4 h-0.5 bg-sky-400 inline-block" /> Demand</span>
        <span className="flex items-center gap-1 text-emerald-400"><span className="w-4 h-0.5 bg-emerald-400 inline-block" /> Supply</span>
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-28 shrink-0">Demand shift</span>
          <input type="range" min={40} max={160} step={5} value={demandIntercept}
            onChange={(e) => setDemandIntercept(Number(e.target.value))}
            className="flex-1 accent-sky-400" />
          <span className="text-xs font-mono text-sky-300 w-10 text-right">{demandIntercept}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-28 shrink-0">Supply shift</span>
          <input type="range" min={5} max={60} step={5} value={supplyIntercept}
            onChange={(e) => setSupplyIntercept(Number(e.target.value))}
            className="flex-1 accent-emerald-400" />
          <span className="text-xs font-mono text-emerald-300 w-10 text-right">{supplyIntercept}</span>
        </div>
      </div>
    </div>
  );
}
