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
  Line,
  LineChart,
  ReferenceLine,
} from "recharts";
import { EfficientFrontierParams } from "@/lib/types";

interface Props {
  params: EfficientFrontierParams;
}

const COLORS = ["#E63C3A", "#38bdf8", "#4ade80", "#a78bfa", "#fb923c"];

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

  // Generate frontier curve (simplified: blend between min and max risk asset)
  const frontierData = useMemo(() => {
    const sorted = [...assets].sort((a, b) => a.stddev - b.stddev);
    if (sorted.length < 2) return [];
    const minAsset = sorted[0];
    const maxAsset = sorted[sorted.length - 1];
    return Array.from({ length: 20 }, (_, i) => {
      const w = i / 19;
      const r = minAsset.return + w * (maxAsset.return - minAsset.return);
      const s = Math.sqrt(
        Math.pow(1 - w, 2) * Math.pow(minAsset.stddev, 2) +
          Math.pow(w, 2) * Math.pow(maxAsset.stddev, 2) +
          2 * w * (1 - w) * 0.2 * minAsset.stddev * maxAsset.stddev
      );
      return { stddev: Math.round(s * 1000) / 10, return: Math.round(r * 1000) / 10 };
    });
  }, [assets]);

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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="stddev"
            type="number"
            name="Risk (σ)"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            domain={["auto", "auto"]}
            label={{ value: "Risk (σ %)", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            dataKey="return"
            type="number"
            name="Return"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            label={{ value: "Return %", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any, name: any) => [`${v}%`, name]}
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

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
        {sharpeRatios.map((a, i) => (
          <div key={a.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <div className="text-xs">
              <span className="text-neutral-400">{a.name}</span>
              <span className="text-neutral-700 ml-1">
                Sharpe: <span className="text-red-400 font-mono">{a.sharpe}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
