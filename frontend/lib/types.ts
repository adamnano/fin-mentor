export type CFACategory =
  | "TVM"
  | "Fixed Income"
  | "Derivatives"
  | "Economics"
  | "FSA"
  | "Portfolio Management"
  | "Ethics"
  | "Equity"
  | "ESG & Sustainability"
  | "Risk Management"
  | "Compliance & AML";

export const ALL_CATEGORIES: CFACategory[] = [
  "TVM",
  "Fixed Income",
  "Derivatives",
  "Economics",
  "FSA",
  "Portfolio Management",
  "Ethics",
  "Equity",
  "ESG & Sustainability",
  "Risk Management",
  "Compliance & AML",
];

export type CFALevel = 1 | 2 | 3;

export type VisualizationType =
  | "TVM"
  | "YieldCurve"
  | "OptionsPayoff"
  | "EfficientFrontier"
  | "SupplyDemand"
  | "BalanceSheet"
  | "RiskMatrix"
  | "ESGScore"
  | null;

export type AppMode = "mcq" | "flashcard" | "news";

export interface Question {
  id?: number;
  source?: "ai" | "db";
  category: CFACategory;
  level: CFALevel;
  difficulty: number;
  questionText: string;
  question_text?: string;
  choiceA: string;
  choice_a?: string;
  choiceB: string;
  choice_b?: string;
  choiceC: string;
  choice_c?: string;
  correctAnswer: "A" | "B" | "C";
  correct_answer?: string;
  explanation: string;
  visualizationType: VisualizationType;
  visualization_type?: string | null;
  visualizationParams: Record<string, unknown> | null;
  visualization_params?: Record<string, unknown> | null;
}

export interface CategoryScore {
  id: number;
  category: string;
  level: number;
  totalAttempts: number;
  correctCount: number;
  total_attempts?: number;
  correct_count?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Typed visualization params
export interface TVMParams {
  principal: number;
  rate: number;
  periods: number;
  type: "FV" | "PV" | "PV_annuity";
}

export interface YieldCurveParams {
  parValue: number;
  couponRate: number;
  ytm: number;
  periods: number;
}

export interface OptionsPayoffParams {
  optionType: "call" | "put";
  strikePrice: number;
  premium: number;
  stockRange: [number, number];
}

export interface EfficientFrontierParams {
  assets: Array<{ name: string; return: number; stddev: number }>;
  riskFreeRate: number;
}

export interface SupplyDemandParams {
  demandIntercept: number;
  supplyIntercept: number;
  demandSlope: number;
  supplySlope: number;
  xLabel?: string;
  yLabel?: string;
}

export interface BalanceSheetParams {
  cash: number;
  receivables: number;
  inventory: number;
  currentLiabilities: number;
  longTermDebt: number;
  equity: number;
}

export interface RiskMatrixParams {
  risks: Array<{
    name: string;
    probability: number; // 1–5
    impact: number;      // 1–5
  }>;
}

export interface ESGScoreParams {
  environmental: number; // 0–100
  social: number;
  governance: number;
  industryEnv: number;
  industrySoc: number;
  industryGov: number;
  companyName: string;
}

export function normalizeQuestion(raw: Record<string, unknown>): Question {
  return {
    id: raw.id as number | undefined,
    source: (raw.source as "ai" | "db") || "db",
    category: (raw.category || raw.category) as CFACategory,
    level: (raw.level as CFALevel) || 1,
    difficulty: (raw.difficulty as number) || 1,
    questionText: (raw.questionText || raw.question_text || "") as string,
    choiceA: (raw.choiceA || raw.choice_a || "") as string,
    choiceB: (raw.choiceB || raw.choice_b || "") as string,
    choiceC: (raw.choiceC || raw.choice_c || "") as string,
    correctAnswer: ((raw.correctAnswer || raw.correct_answer || "A") as string).toUpperCase() as "A" | "B" | "C",
    explanation: (raw.explanation || "") as string,
    visualizationType: (raw.visualizationType || raw.visualization_type || null) as VisualizationType,
    visualizationParams: (raw.visualizationParams || raw.visualization_params || null) as Record<string, unknown> | null,
  };
}
