"use client";

import dynamic from "next/dynamic";
import {
  VisualizationType,
  TVMParams,
  YieldCurveParams,
  OptionsPayoffParams,
  EfficientFrontierParams,
  SupplyDemandParams,
  BalanceSheetParams,
  RiskMatrixParams,
  ESGScoreParams,
} from "@/lib/types";

const TVMChart = dynamic(() => import("./visualizations/TVMChart"), { ssr: false });
const YieldCurveChart = dynamic(() => import("./visualizations/YieldCurveChart"), { ssr: false });
const OptionsPayoffChart = dynamic(() => import("./visualizations/OptionsPayoffChart"), { ssr: false });
const EfficientFrontierChart = dynamic(() => import("./visualizations/EfficientFrontierChart"), { ssr: false });
const SupplyDemandChart = dynamic(() => import("./visualizations/SupplyDemandChart"), { ssr: false });
const BalanceSheetChart = dynamic(() => import("./visualizations/BalanceSheetChart"), { ssr: false });
const RiskMatrixChart = dynamic(() => import("./visualizations/RiskMatrixChart"), { ssr: false });
const ESGScoreChart = dynamic(() => import("./visualizations/ESGScoreChart"), { ssr: false });

interface Props {
  type: VisualizationType;
  params: Record<string, unknown> | null;
  category?: string;
}

const EMPTY_PANEL_CONTENT: Record<string, { icon: string; title: string; values: string[] }> = {
  "Ethics": {
    icon: "⚖️",
    title: "CFA Ethics & Professional Standards",
    values: ["Independence", "Integrity", "Diligence", "Fairness"],
  },
  "Compliance & AML": {
    icon: "🛡️",
    title: "Regulatory Compliance Framework",
    values: ["KYC / CDD", "AML Monitoring", "FATF Standards", "Reporting"],
  },
};

export default function VisualizationPanel({ type, params, category }: Props) {
  if (!type || !params) {
    const panel = EMPTY_PANEL_CONTENT[category ?? ""] ?? EMPTY_PANEL_CONTENT["Ethics"];
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="text-4xl">{panel.icon}</div>
        <p className="text-sm text-neutral-500 leading-relaxed font-medium">{panel.title}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 w-full text-xs">
          {panel.values.map((v) => (
            <div key={v} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-2.5 text-neutral-500 text-center tracking-wide">
              {v}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = params as any;

  switch (type) {
    case "TVM":
      return <TVMChart params={p as TVMParams} />;
    case "YieldCurve":
      return <YieldCurveChart params={p as YieldCurveParams} />;
    case "OptionsPayoff":
      return <OptionsPayoffChart params={p as OptionsPayoffParams} />;
    case "EfficientFrontier":
      return <EfficientFrontierChart params={p as EfficientFrontierParams} />;
    case "SupplyDemand":
      return <SupplyDemandChart params={p as SupplyDemandParams} />;
    case "BalanceSheet":
      return <BalanceSheetChart params={p as BalanceSheetParams} />;
    case "RiskMatrix":
      return <RiskMatrixChart params={p as RiskMatrixParams} />;
    case "ESGScore":
      return <ESGScoreChart params={p as ESGScoreParams} />;
    default:
      return null;
  }
}
