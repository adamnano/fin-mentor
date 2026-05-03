import { db } from "./index";
import { questions } from "./schema";

const seedQuestions = [
  // ── TVM ──────────────────────────────────────────────────────────────────
  {
    category: "TVM",
    level: 1,
    difficulty: 1,
    questionText:
      "An investor deposits $1,000 today in an account earning 5% per year compounded annually. What is the future value after 10 years?",
    choiceA: "$1,500.00",
    choiceB: "$1,628.89",
    choiceC: "$1,050.00",
    correctAnswer: "B",
    explanation:
      "FV = PV × (1 + r)^n = 1000 × (1.05)^10 = $1,628.89. Compound interest grows exponentially — not linearly — which is why choice A ($1,500) is wrong.",
    visualizationType: "TVM",
    visualizationParams: { principal: 1000, rate: 0.05, periods: 10, type: "FV" },
  },
  {
    category: "TVM",
    level: 1,
    difficulty: 2,
    questionText:
      "You need $50,000 in 8 years. If you can earn 6% per year, how much must you invest today (present value)?",
    choiceA: "$31,392",
    choiceB: "$29,752",
    choiceC: "$34,000",
    correctAnswer: "A",
    explanation:
      "PV = FV / (1 + r)^n = 50,000 / (1.06)^8 = $31,392. Discounting reverses compounding — each year back reduces the required investment.",
    visualizationType: "TVM",
    visualizationParams: { principal: 50000, rate: 0.06, periods: 8, type: "PV" },
  },
  {
    category: "TVM",
    level: 1,
    difficulty: 3,
    questionText:
      "An annuity pays $500 per year for 5 years, starting one year from now. At a discount rate of 7%, what is the present value of this annuity?",
    choiceA: "$2,050.10",
    choiceB: "$2,500.00",
    choiceC: "$1,900.00",
    correctAnswer: "A",
    explanation:
      "PV of ordinary annuity = PMT × [1 − (1+r)^(−n)] / r = 500 × [1 − (1.07)^(−5)] / 0.07 ≈ $2,050. Each cash flow is discounted back individually.",
    visualizationType: "TVM",
    visualizationParams: { principal: 500, rate: 0.07, periods: 5, type: "PV_annuity" },
  },

  // ── Fixed Income ─────────────────────────────────────────────────────────
  {
    category: "Fixed Income",
    level: 1,
    difficulty: 2,
    questionText:
      "A bond has a face value of $1,000, a 6% annual coupon, and matures in 5 years. If the yield to maturity (YTM) is 8%, what is the bond's price?",
    choiceA: "$920.15",
    choiceB: "$1,000.00",
    choiceC: "$1,079.85",
    correctAnswer: "A",
    explanation:
      "When YTM > coupon rate, the bond trades at a discount. Price = Σ (60 / 1.08^t) for t=1..5 + 1000/1.08^5 ≈ $920.15. A higher required yield means investors pay less today.",
    visualizationType: "YieldCurve",
    visualizationParams: { parValue: 1000, couponRate: 0.06, ytm: 0.08, periods: 5 },
  },
  {
    category: "Fixed Income",
    level: 2,
    difficulty: 3,
    questionText:
      "A bond's modified duration is 4.5 years and its YTM rises from 5% to 6%. Approximately how much does the bond's price change (in %)?",
    choiceA: "−4.5%",
    choiceB: "+4.5%",
    choiceC: "−0.45%",
    correctAnswer: "A",
    explanation:
      "% ΔPrice ≈ −Modified Duration × ΔYield = −4.5 × (+0.01) = −4.5%. Duration measures the price sensitivity to interest rate changes — higher duration means more sensitivity.",
    visualizationType: "YieldCurve",
    visualizationParams: { parValue: 1000, couponRate: 0.05, ytm: 0.05, periods: 10 },
  },

  // ── Derivatives ──────────────────────────────────────────────────────────
  {
    category: "Derivatives",
    level: 1,
    difficulty: 2,
    questionText:
      "You buy a call option on Stock XYZ with a strike price of $50 and pay a premium of $3. At expiration, the stock trades at $62. What is your profit?",
    choiceA: "$9",
    choiceB: "$12",
    choiceC: "$3",
    correctAnswer: "A",
    explanation:
      "Profit = max(S − K, 0) − Premium = max(62 − 50, 0) − 3 = 12 − 3 = $9. The option lets you buy at $50 and sell at $62, but you subtract the cost of the option.",
    visualizationType: "OptionsPayoff",
    visualizationParams: {
      optionType: "call",
      strikePrice: 50,
      premium: 3,
      stockRange: [35, 70],
    },
  },
  {
    category: "Derivatives",
    level: 1,
    difficulty: 2,
    questionText:
      "You buy a put option on Stock ABC with a strike price of $40 and pay a premium of $2. At expiration, the stock trades at $30. What is your profit?",
    choiceA: "$8",
    choiceB: "$10",
    choiceC: "$2",
    correctAnswer: "A",
    explanation:
      "Profit = max(K − S, 0) − Premium = max(40 − 30, 0) − 2 = 10 − 2 = $8. A put gives the right to sell at the strike — profitable when the stock falls below strike.",
    visualizationType: "OptionsPayoff",
    visualizationParams: {
      optionType: "put",
      strikePrice: 40,
      premium: 2,
      stockRange: [20, 55],
    },
  },

  // ── Portfolio Management ──────────────────────────────────────────────────
  {
    category: "Portfolio Management",
    level: 1,
    difficulty: 2,
    questionText:
      "Portfolio A has an expected return of 12% and standard deviation of 15%. The risk-free rate is 4%. What is the Sharpe ratio of Portfolio A?",
    choiceA: "0.53",
    choiceB: "0.80",
    choiceC: "1.20",
    correctAnswer: "A",
    explanation:
      "Sharpe ratio = (E(R) − Rf) / σ = (12% − 4%) / 15% = 8% / 15% ≈ 0.53. It measures excess return per unit of total risk — higher is better.",
    visualizationType: "EfficientFrontier",
    visualizationParams: {
      assets: [
        { name: "Portfolio A", return: 0.12, stddev: 0.15 },
        { name: "Portfolio B", return: 0.08, stddev: 0.08 },
        { name: "Risk-Free", return: 0.04, stddev: 0 },
      ],
      riskFreeRate: 0.04,
    },
  },
  {
    category: "Portfolio Management",
    level: 2,
    difficulty: 3,
    questionText:
      "An investor holds two assets: Asset A (weight 60%, σ=20%) and Asset B (weight 40%, σ=10%). The correlation between them is 0.2. What is the portfolio's standard deviation?",
    choiceA: "13.4%",
    choiceB: "16.0%",
    choiceC: "14.0%",
    correctAnswer: "A",
    explanation:
      "σ_p = √(w_A²σ_A² + w_B²σ_B² + 2w_Aw_Bρσ_Aσ_B) = √(0.36×0.04 + 0.16×0.01 + 2×0.6×0.4×0.2×0.2×0.1) = √0.01792 ≈ 13.4%. Diversification reduces risk when correlation < 1.",
    visualizationType: "EfficientFrontier",
    visualizationParams: {
      assets: [
        { name: "Asset A", return: 0.14, stddev: 0.2 },
        { name: "Asset B", return: 0.08, stddev: 0.1 },
      ],
      riskFreeRate: 0.03,
    },
  },

  // ── Economics ─────────────────────────────────────────────────────────────
  {
    category: "Economics",
    level: 1,
    difficulty: 1,
    questionText:
      "According to the Quantity Theory of Money (MV = PQ), if the money supply increases by 10% and real output (Q) grows by 2% while velocity (V) is constant, what happens to the price level?",
    choiceA: "Increases by approximately 8%",
    choiceB: "Increases by approximately 10%",
    choiceC: "Decreases by approximately 2%",
    correctAnswer: "A",
    explanation:
      "MV = PQ → %ΔM + %ΔV = %ΔP + %ΔQ → 10% + 0% = %ΔP + 2% → %ΔP ≈ 8%. When money supply grows faster than output, inflation results.",
    visualizationType: "SupplyDemand",
    visualizationParams: {
      demandIntercept: 100,
      supplyIntercept: 20,
      demandSlope: -2,
      supplySlope: 1.5,
      xLabel: "Quantity of Money",
      yLabel: "Price Level",
    },
  },
  {
    category: "Economics",
    level: 1,
    difficulty: 2,
    questionText:
      "In a competitive labor market, the government imposes a minimum wage above the equilibrium wage. What is the most likely result?",
    choiceA: "Unemployment increases as labor supplied exceeds labor demanded",
    choiceB: "Wages fall to clear the market",
    choiceC: "Employers hire more workers to meet demand",
    correctAnswer: "A",
    explanation:
      "A price floor (minimum wage) set above equilibrium creates a surplus — more workers want to work at the higher wage than employers want to hire. The gap between labor supplied and demanded represents unemployment.",
    visualizationType: "SupplyDemand",
    visualizationParams: {
      demandIntercept: 80,
      supplyIntercept: 10,
      demandSlope: -1.5,
      supplySlope: 1.2,
      xLabel: "Labor",
      yLabel: "Wage",
    },
  },

  // ── Financial Statement Analysis ──────────────────────────────────────────
  {
    category: "FSA",
    level: 1,
    difficulty: 1,
    questionText:
      "A company has current assets of $600,000, inventory of $150,000, and current liabilities of $250,000. What is the quick ratio?",
    choiceA: "1.8",
    choiceB: "2.4",
    choiceC: "0.6",
    correctAnswer: "A",
    explanation:
      "Quick ratio = (Current Assets − Inventory) / Current Liabilities = (600,000 − 150,000) / 250,000 = 450,000 / 250,000 = 1.8. The quick ratio excludes inventory because it may not be quickly convertible to cash.",
    visualizationType: "BalanceSheet",
    visualizationParams: {
      cash: 200000,
      receivables: 250000,
      inventory: 150000,
      currentLiabilities: 250000,
      longTermDebt: 300000,
      equity: 650000,
    },
  },
  {
    category: "FSA",
    level: 1,
    difficulty: 2,
    questionText:
      "A firm's net income is $200,000 and total equity is $1,000,000. Total assets are $2,500,000 and sales are $1,500,000. What is the Return on Equity (ROE)?",
    choiceA: "20%",
    choiceB: "8%",
    choiceC: "13.3%",
    correctAnswer: "A",
    explanation:
      "ROE = Net Income / Total Equity = 200,000 / 1,000,000 = 20%. Using the DuPont framework: ROE = Net Profit Margin × Asset Turnover × Leverage = 13.3% × 0.6 × 2.5 = 20%.",
    visualizationType: "BalanceSheet",
    visualizationParams: {
      cash: 300000,
      receivables: 700000,
      inventory: 500000,
      currentLiabilities: 400000,
      longTermDebt: 1100000,
      equity: 1000000,
    },
  },

  // ── Ethics ────────────────────────────────────────────────────────────────
  {
    category: "Ethics",
    level: 1,
    difficulty: 1,
    questionText:
      "An analyst discovers material non-public information about a merger while overhearing a conversation in a restaurant. According to CFA Institute Standards, the analyst should:",
    choiceA: "Not trade on the information and report it to their compliance department",
    choiceB: "Trade immediately before the information becomes public",
    choiceC: "Share the information with select clients who can act quickly",
    correctAnswer: "A",
    explanation:
      "Standard II(A) — Material Non-public Information: Members must not trade or cause others to trade on material non-public information. The correct action is to notify compliance and refrain from using the information until it is made public.",
    visualizationType: null,
    visualizationParams: null,
  },
  {
    category: "Ethics",
    level: 1,
    difficulty: 2,
    questionText:
      "A portfolio manager receives a gift worth $500 from a client as a token of appreciation for strong returns. What is the most appropriate action under CFA Standards?",
    choiceA: "Disclose the gift to the employer and obtain written permission before accepting",
    choiceB: "Accept the gift since it is a personal gesture unrelated to professional duties",
    choiceC: "Return the gift immediately regardless of employer policy",
    correctAnswer: "A",
    explanation:
      "Standard I(B) — Independence and Objectivity: Members must disclose gifts to their employer and, when required by policy, receive written permission. Gifts above modest value can create conflicts of interest that compromise objectivity.",
    visualizationType: null,
    visualizationParams: null,
  },

  // ── ESG & Sustainability ──────────────────────────────────────────────────
  {
    category: "ESG & Sustainability",
    level: 1,
    difficulty: 2,
    questionText:
      "A financial analyst is evaluating two companies. Company A has a high carbon footprint but strong governance scores. Company B has excellent environmental ratings but weak board oversight. From an ESG perspective, which factor most directly increases systemic risk?",
    choiceA: "Company A's carbon footprint, because regulatory transition risk can affect long-term cash flows",
    choiceB: "Company B's weak governance, because poor oversight is universally the highest ESG risk",
    choiceC: "Neither — ESG factors are non-financial and do not affect investment risk",
    correctAnswer: "A",
    explanation:
      "Transition risk — the risk that regulatory or market shifts away from carbon-intensive activities impair asset values — is increasingly priced by institutional investors. While governance risk is also significant, carbon regulation directly threatens operating licenses and future cash flows in carbon-heavy sectors.",
    visualizationType: "ESGScore",
    visualizationParams: {
      environmental: 32,
      social: 61,
      governance: 78,
      industryEnv: 55,
      industrySoc: 58,
      industryGov: 62,
      companyName: "Company A",
    },
  },
  {
    category: "ESG & Sustainability",
    level: 2,
    difficulty: 3,
    questionText:
      "A sovereign wealth fund mandates that all equity holdings must have an ESG score above 60/100. The fund's current portfolio has an average score of 55. Which approach best aligns with fiduciary duty while meeting the mandate?",
    choiceA: "Engage with low-scoring holdings to improve scores, then divest those that fail to improve within 24 months",
    choiceB: "Immediately divest all holdings below 60 to comply with the mandate regardless of financial impact",
    choiceC: "Apply for a mandate waiver since ESG criteria conflict with maximizing risk-adjusted returns",
    correctAnswer: "A",
    explanation:
      "Active engagement ('active ownership') allows fund managers to fulfil their fiduciary duty by improving portfolio sustainability while avoiding forced selling at potentially disadvantageous prices. Immediate divestment ignores price impact and engagement value; seeking a waiver contradicts the fund's stated mandate.",
    visualizationType: "ESGScore",
    visualizationParams: {
      environmental: 55,
      social: 58,
      governance: 52,
      industryEnv: 63,
      industrySoc: 60,
      industryGov: 65,
      companyName: "Portfolio Avg",
    },
  },

  // ── Risk Management ───────────────────────────────────────────────────────
  {
    category: "Risk Management",
    level: 1,
    difficulty: 2,
    questionText:
      "A bank calculates that its 1-day 99% Value at Risk (VaR) is $2 million. Which statement correctly interprets this measure?",
    choiceA: "There is a 1% chance that daily losses will exceed $2 million under normal market conditions",
    choiceB: "The bank is guaranteed not to lose more than $2 million on any given day",
    choiceC: "The expected daily loss is $2 million on average",
    correctAnswer: "A",
    explanation:
      "VaR at the 99% confidence level means losses are expected to exceed $2M on 1% of trading days — approximately 2–3 days per year under normal conditions. VaR does NOT cap losses (tail events can far exceed VaR) and does NOT represent average losses.",
    visualizationType: "RiskMatrix",
    visualizationParams: {
      risks: [
        { name: "Market Risk", probability: 4, impact: 4 },
        { name: "Credit Risk", probability: 3, impact: 5 },
        { name: "Liquidity Risk", probability: 2, impact: 4 },
        { name: "Operational Risk", probability: 3, impact: 3 },
        { name: "Model Risk", probability: 2, impact: 3 },
      ],
    },
  },
  {
    category: "Risk Management",
    level: 2,
    difficulty: 3,
    questionText:
      "Under the Basel III framework, a bank must hold a minimum Common Equity Tier 1 (CET1) ratio of 4.5% plus a capital conservation buffer of 2.5%. A bank with risk-weighted assets of $100 billion and CET1 capital of $6.5 billion is:",
    choiceA: "Below the combined requirement of 7% CET1; it may face dividend restrictions",
    choiceB: "Fully compliant since $6.5B exceeds the minimum CET1 requirement of $4.5B",
    choiceC: "Non-compliant and must immediately suspend all operations",
    correctAnswer: "A",
    explanation:
      "The combined CET1 requirement = 4.5% + 2.5% conservation buffer = 7.0%. The bank's CET1 ratio = 6.5B / 100B = 6.5%, which is above the 4.5% minimum but below the 7% combined buffer. Banks below the combined buffer face restrictions on distributions (dividends, buybacks, bonuses) but are not required to cease operations.",
    visualizationType: "RiskMatrix",
    visualizationParams: {
      risks: [
        { name: "Capital Shortfall", probability: 4, impact: 5 },
        { name: "Regulatory Breach", probability: 3, impact: 4 },
        { name: "Dividend Restriction", probability: 5, impact: 3 },
        { name: "Reputation Risk", probability: 3, impact: 3 },
      ],
    },
  },

  // ── Compliance & AML ─────────────────────────────────────────────────────
  {
    category: "Compliance & AML",
    level: 1,
    difficulty: 2,
    questionText:
      "A bank's compliance officer notices that a new business customer makes 15 cash deposits just below the $10,000 reporting threshold over three weeks. This pattern is best described as:",
    choiceA: "Structuring (smurfing) — a money laundering technique designed to evade Currency Transaction Reports",
    choiceB: "Normal commercial behavior that does not require further review",
    choiceC: "Tax evasion, which should be reported to the tax authority rather than a financial intelligence unit",
    correctAnswer: "A",
    explanation:
      "Structuring — breaking transactions into smaller amounts to stay below reporting thresholds — is itself a federal crime under the Bank Secrecy Act, regardless of the underlying source of funds. The correct action is to file a Suspicious Activity Report (SAR) with the financial intelligence unit. AML monitoring systems are specifically designed to detect this pattern.",
    visualizationType: null,
    visualizationParams: null,
  },
  {
    category: "Compliance & AML",
    level: 2,
    difficulty: 3,
    questionText:
      "Under the FATF 40 Recommendations, which of the following is a core obligation of a risk-based AML/CFT program?",
    choiceA: "Applying enhanced due diligence (EDD) proportionate to the risk level of customers, products, and jurisdictions",
    choiceB: "Treating all customers identically to avoid discrimination",
    choiceC: "Reporting every transaction above $1,000 to the financial intelligence unit",
    correctAnswer: "A",
    explanation:
      "The FATF risk-based approach (RBA) requires institutions to identify, assess and understand ML/TF risks and apply mitigation measures proportionate to those risks. Higher-risk customers (PEPs, correspondent banks, high-risk jurisdictions) require Enhanced Due Diligence. Uniform treatment of all customers contradicts the RBA; mandatory reporting thresholds vary by jurisdiction and do not apply universally.",
    visualizationType: null,
    visualizationParams: null,
  },
];

async function main() {
  console.log("Clearing existing sessions and questions...");
  // Must delete sessions first (FK constraint) then questions
  const { userSessions } = await import("./schema");
  await db.delete(userSessions);
  await db.delete(questions);
  console.log(`Seeding ${seedQuestions.length} questions...`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.insert(questions).values(seedQuestions as any);
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
