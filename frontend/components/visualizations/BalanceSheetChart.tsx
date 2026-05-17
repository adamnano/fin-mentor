"use client";

import { useState, useMemo } from "react";
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
  // Offset initial values from correct params
  const [cash, setCash] = useState(() =>
    params.cash > 500000 ? Math.round(params.cash * 0.25) : Math.min(params.cash * 3, 900000)
  );
  const [receivables] = useState(params.receivables);
  const [inventory] = useState(params.inventory);
  const [currentLiabilities, setCurrentLiabilities] = useState(() =>
    params.currentLiabilities > 500000 ? Math.round(params.currentLiabilities * 0.3) : Math.min(params.currentLiabilities * 2.5, 900000)
  );
  const [longTermDebt] = useState(params.longTermDebt);
  const [equity, setEquity] = useState(() =>
    params.equity > 1000000 ? Math.round(params.equity * 0.2) : Math.min(params.equity * 2, 1800000)
  );

  const currentAssets = cash + receivables + inventory;
  const totalLiabilities = currentLiabilities + longTermDebt;

  const ratios = useMemo(() => ({
    current: (currentAssets / (currentLiabilities || 1)).toFixed(2),
    quick: ((cash + receivables) / (currentLiabilities || 1)).toFixed(2),
    debtToEquity: ((currentLiabilities + longTermDebt) / (equity || 1)).toFixed(2),
  }), [cash, receivables, inventory, currentLiabilities, longTermDebt, equity, currentAssets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand uppercase tracking-wider">
          Balance Sheet
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="text-neutral-600">Current: <strong className="text-brand">{ratios.current}x</strong></span>
          <span className="text-neutral-600">Quick: <strong className="text-brand">{ratios.quick}x</strong></span>
          <span className="text-neutral-600">D/E: <strong className="text-brand">{ratios.debtToEquity}x</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">ASSETS</div>
          <div className="rounded-xl overflow-hidden border border-white/[0.08]">
            <div className="bg-emerald-500/15 p-2 flex justify-between text-xs">
              <span className="text-emerald-400">Cash</span>
              <span className="font-mono text-white">{fmt(cash)}</span>
            </div>
            <div className="bg-sky-500/15 p-2 flex justify-between text-xs">
              <span className="text-sky-400">Receivables</span>
              <span className="font-mono text-white">{fmt(receivables)}</span>
            </div>
            <div className="bg-violet-500/15 p-2 flex justify-between text-xs">
              <span className="text-violet-400">Inventory</span>
              <span className="font-mono text-white">{fmt(inventory)}</span>
            </div>
            <div className="bg-white/[0.04] p-2 flex justify-between text-xs font-semibold border-t border-white/[0.08]">
              <span className="text-white">Current Assets</span>
              <span className="font-mono text-brand">{fmt(currentAssets)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">LIAB & EQUITY</div>
          <div className="rounded-xl overflow-hidden border border-white/[0.08]">
            <div className="bg-red-500/15 p-2 flex justify-between text-xs">
              <span className="text-red-400">Current Liab.</span>
              <span className="font-mono text-white">{fmt(currentLiabilities)}</span>
            </div>
            <div className="bg-orange-500/15 p-2 flex justify-between text-xs">
              <span className="text-orange-400">LT Debt</span>
              <span className="font-mono text-white">{fmt(longTermDebt)}</span>
            </div>
            <div className="bg-amber-500/15 p-2 flex justify-between text-xs">
              <span className="text-amber-400">Equity</span>
              <span className="font-mono text-white">{fmt(equity)}</span>
            </div>
            <div className="bg-white/[0.04] p-2 flex justify-between text-xs font-semibold border-t border-white/[0.08]">
              <span className="text-white">Total L+E</span>
              <span className="font-mono text-brand">{fmt(totalLiabilities + equity)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-3 border-t border-white/[0.07]">
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold">Adjust to explore</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 w-28 shrink-0">Cash</span>
          <input type="range" min={0} max={1000000} step={25000} value={cash}
            onChange={(e) => setCash(Number(e.target.value))} className="flex-1 accent-emerald-400" />
          <span className="text-xs font-mono text-emerald-400 w-14 text-right">{fmt(cash)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-red-400 w-28 shrink-0">Current Liab.</span>
          <input type="range" min={50000} max={1000000} step={25000} value={currentLiabilities}
            onChange={(e) => setCurrentLiabilities(Number(e.target.value))} className="flex-1 accent-red-400" />
          <span className="text-xs font-mono text-red-400 w-14 text-right">{fmt(currentLiabilities)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-400 w-28 shrink-0">Equity</span>
          <input type="range" min={50000} max={2000000} step={50000} value={equity}
            onChange={(e) => setEquity(Number(e.target.value))} className="flex-1 accent-emerald-400" />
          <span className="text-xs font-mono text-amber-400 w-14 text-right">{fmt(equity)}</span>
        </div>
      </div>
    </div>
  );
}
