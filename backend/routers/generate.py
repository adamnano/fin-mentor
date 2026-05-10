import json
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.openai_client import generate_completion

router = APIRouter()

VISUALIZATION_MAP = {
    "TVM": {"visualization_type": "TVM", "visualization_params": {"principal": 1000, "rate": 0.05, "periods": 10, "type": "FV"}},
    "Fixed Income": {"visualization_type": "YieldCurve", "visualization_params": {"parValue": 1000, "couponRate": 0.06, "ytm": 0.07, "periods": 10}},
    "Derivatives": {"visualization_type": "OptionsPayoff", "visualization_params": {"optionType": "call", "strikePrice": 50, "premium": 3, "stockRange": [30, 70]}},
    "Portfolio Management": {"visualization_type": "EfficientFrontier", "visualization_params": {"assets": [{"name": "Asset A", "return": 0.12, "stddev": 0.18}, {"name": "Asset B", "return": 0.08, "stddev": 0.10}], "riskFreeRate": 0.04}},
    "Economics": {"visualization_type": "SupplyDemand", "visualization_params": {"demandIntercept": 100, "supplyIntercept": 20, "demandSlope": -2, "supplySlope": 1.5, "xLabel": "Quantity", "yLabel": "Price"}},
    "FSA": {"visualization_type": "BalanceSheet", "visualization_params": {"cash": 200000, "receivables": 300000, "inventory": 150000, "currentLiabilities": 250000, "longTermDebt": 300000, "equity": 400000}},
    "Equity": {"visualization_type": "BalanceSheet", "visualization_params": {"cash": 150000, "receivables": 250000, "inventory": 100000, "currentLiabilities": 200000, "longTermDebt": 200000, "equity": 300000}},
    "Ethics": {"visualization_type": None, "visualization_params": None},
    "ESG & Sustainability": {"visualization_type": "ESGScore", "visualization_params": {"environmental": 55, "social": 60, "governance": 65, "industryEnv": 58, "industrySoc": 62, "industryGov": 68, "companyName": "Sample Co."}},
    "Risk Management": {"visualization_type": "RiskMatrix", "visualization_params": {"risks": [{"name": "Market Risk", "probability": 4, "impact": 4}, {"name": "Credit Risk", "probability": 3, "impact": 5}, {"name": "Liquidity Risk", "probability": 2, "impact": 4}, {"name": "Operational Risk", "probability": 3, "impact": 3}]}},
    "Compliance & AML": {"visualization_type": None, "visualization_params": None},
}

GENERATE_PROMPT = """You are an expert financial certification exam question writer. Generate ONE challenging multiple-choice question for financial professionals.

Category: {category}
Exam Level: {level}
Difficulty (1=easy, 5=hard): {difficulty}

Category guidance:
- TVM / Fixed Income / Derivatives / Portfolio Management / Economics / FSA / Equity: CFA Institute curriculum style
- Ethics: CFA Standards of Professional Conduct scenarios
- ESG & Sustainability: TCFD, SASB, GRI frameworks, green bonds, impact investing, climate risk
- Risk Management: Basel III/IV, VaR, stress testing, credit/market/operational/liquidity risk
- Compliance & AML: FATF 40 Recommendations, KYC/CDD/EDD, SAR filing, sanctions screening

Requirements:
- Scenario-based, quantitative where appropriate
- Three answer choices (A, B, C) — only one is correct
- Wrong choices should be plausible and represent common mistakes
- Explanation should teach the underlying concept, not just state the answer

Return ONLY valid JSON with this exact structure (no markdown, no preamble):
{{
  "question_text": "...",
  "choice_a": "...",
  "choice_b": "...",
  "choice_c": "...",
  "correct_answer": "A",
  "explanation": "..."
}}"""


def extract_json(text: str) -> dict:
    text = text.strip()
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in model response")
    return json.loads(match.group())


class GenerateRequest(BaseModel):
    category: str
    level: int = 1
    difficulty: int = 2


@router.post("/generate")
async def generate_question(req: GenerateRequest):
    prompt = GENERATE_PROMPT.format(
        category=req.category,
        level=req.level,
        difficulty=req.difficulty,
    )

    last_error = None
    for attempt in range(2):
        try:
            raw = await generate_completion(prompt)
            data = extract_json(raw)

            viz = VISUALIZATION_MAP.get(req.category, {"visualization_type": None, "visualization_params": None})

            return {
                "source": "ai",
                "category": req.category,
                "level": req.level,
                "difficulty": req.difficulty,
                "question_text": data["question_text"],
                "choice_a": data["choice_a"],
                "choice_b": data["choice_b"],
                "choice_c": data["choice_c"],
                "correct_answer": data["correct_answer"].upper(),
                "explanation": data["explanation"],
                "visualization_type": viz["visualization_type"],
                "visualization_params": viz["visualization_params"],
            }
        except Exception as e:
            last_error = str(e)
            continue

    raise HTTPException(
        status_code=422,
        detail=f"Model failed to produce valid JSON after 2 attempts. Last error: {last_error}",
    )
