"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { BalanceSheetParams } from "@/lib/types";

interface Props {
  params: BalanceSheetParams;
}

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export default function BalanceSheetChart({ params }: Props) {
  const [cash, setCash] = useState(params.cash);
  const [receivables, setReceivables] = useState(params.receivables);
  const [inventory, setInventory] = useState(params.inventory);
  const [currentLiabilities, setCurrentLiabilities] = useState(params.currentLiabilities);
  const [longTermDebt, setLongTermDebt] = useState(params.longTermDebt);
  const [equity, setEquity] = useState(params.equity);

  const currentAssets = cash + receivables + inventory;
  const totalAssets = currentAssets + equity * 0.3;
  const totalLiabilities = currentLiabilities + longTermDebt;

  const ratios = useMemo(() => ({
    current: ((currentAssets) / (currentLiabilities || 1)).toFixed(2),
    quick: ((cash + receivables) / (currentLiabilities || 1)).toFixed(2),
    debtToEquity: ((currentLiabilities + longTermDebt) / (equity || 1)).toFixed(2),
  }), [cash, receivables, inventory, currentLiabilities, longTermDebt, equity]);

  const data = [
    {
      name: "Assets",
      cash,
      receivables,
      inventory,
    },
    {
      name: "Liabilities & Equity",
      currentLiabilities,
      longTermDebt,
      equity,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
          Balance Sheet
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="text-neutral-600">Current: <strong className="text-red-400">{ratios.current}x</strong></span>
          <span className="text-neutral-600">Quick: <strong className="text-red-400">{ratios.quick}x</strong></span>
          <span className="text-neutral-600">D/E: <strong className="text-red-400">{ratios.debtToEquity}x</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Assets column */}
        <div className="space-y-1.5">
          <div className="text-xs text-neutral-600 font-medium">ASSETS</div>
          <div className="rounded-lg overflow-hidden border border-white/10">
            <div className="bg-emerald-500/20 p-2 flex justify-between text-xs">
              <span className="text-emerald-300">Cash</span>
              <span className="font-mono text-white">{fmt(cash)}</span>
            </div>
            <div className="bg-sky-500/20 p-2 flex justify-between text-xs">
              <span className="text-sky-300">Receivables</span>
              <span className="font-mono text-white">{fmt(receivables)}</span>
            </div>
            <div className="bg-violet-500/20 p-2 flex justify-between text-xs">
              <span className="text-violet-300">Inventory</span>
              <span className="font-mono text-white">{fmt(inventory)}</span>
            </div>
            <div className="bg-white/5 p-2 flex justify-between text-xs font-semibold border-t border-white/10">
              <span className="text-white">Current Assets</span>
              <span className="font-mono text-red-400">{fmt(currentAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities & Equity column */}
        <div className="space-y-1.5">
          <div className="text-xs text-neutral-600 font-medium">LIABILITIES & EQUITY</div>
          <div className="rounded-lg overflow-hidden border border-white/10">
            <div className="bg-red-500/20 p-2 flex justify-between text-xs">
              <span className="text-red-300">Current Liab.</span>
              <span className="font-mono text-white">{fmt(currentLiabilities)}</span>
            </div>
            <div className="bg-orange-500/20 p-2 flex justify-between text-xs">
              <span className="text-orange-300">LT Debt</span>
              <span className="font-mono text-white">{fmt(longTermDebt)}</span>
            </div>
            <div className="bg-amber-500/20 p-2 flex justify-between text-xs">
              <span className="text-red-400">Equity</span>
              <span className="font-mono text-white">{fmt(equity)}</span>
            </div>
            <div className="bg-white/5 p-2 flex justify-between text-xs font-semibold border-t border-white/10">
              <span className="text-white">Total L+E</span>
              <span className="font-mono text-red-400">{fmt(totalLiabilities + equity)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 w-28 shrink-0">Cash</span>
          <input type="range" min={0} max={1000000} step={25000} value={cash}
            onChange={(e) => setCash(Number(e.target.value))} className="flex-1 accent-emerald-400" />
          <span className="text-xs font-mono text-emerald-300 w-14 text-right">{fmt(cash)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-red-400 w-28 shrink-0">Current Liab.</span>
          <input type="range" min={50000} max={1000000} step={25000} value={currentLiabilities}
            onChange={(e) => setCurrentLiabilities(Number(e.target.value))} className="flex-1 accent-red-400" />
          <span className="text-xs font-mono text-red-300 w-14 text-right">{fmt(currentLiabilities)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-red-400 w-28 shrink-0">Equity</span>
          <input type="range" min={50000} max={2000000} step={50000} value={equity}
            onChange={(e) => setEquity(Number(e.target.value))} className="flex-1 accent-red-500" />
          <span className="text-xs font-mono text-red-400 w-14 text-right">{fmt(equity)}</span>
        </div>
      </div>
    </div>
  );
}
