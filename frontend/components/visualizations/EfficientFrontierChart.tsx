"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EfficientFrontierParams } from "@/lib/types";

interface Props {
  params: EfficientFrontierParams;
}

const COLORS = ["#8B9130", "#38bdf8", "#4ade80", "#a78bfa", "#fb923c"];

export default function EfficientFrontierChart({ params }: Props) {
  const { assets, riskFreeRate } = params;

  const sharpeRatios = useMemo(
    () =>
      assets.map((a) => ({
        ...a,
        sharpe:
          a.stddev > 0
            ? ((a.return - riskFreeRate) / a.stddev).toFixed(2)
            : "∞",
      })),
    [assets, riskFreeRate]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Risk / Return
        </h3>
        <span className="text-xs text-neutral-600">
          Rf = {(riskFreeRate * 100).toFixed(1)}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis
            dataKey="stddev"
            type="number"
            name="Risk (σ)"
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            domain={["auto", "auto"]}
            label={{ value: "Risk (σ %)", position: "insideBottom", offset: -2, fill: "#71717a", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            dataKey="return"
            type="number"
            name="Return"
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            label={{ value: "Return %", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 12 }}
            formatter={(v: unknown, name: unknown) => [`${v}%`, name as string]}
          />
          {assets.map((asset, i) => (
            <Scatter
              key={asset.name}
              name={asset.name}
              data={[{ stddev: asset.stddev * 100, return: asset.return * 100, name: asset.name }]}
              fill={COLORS[i % COLORS.length]}
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.07]">
        {sharpeRatios.map((a, i) => (
          <div key={a.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <div className="text-xs">
              <span className="text-neutral-400">{a.name}</span>
              <span className="text-neutral-600 ml-1">
                Sharpe: <span className="text-brand font-mono">{a.sharpe}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
