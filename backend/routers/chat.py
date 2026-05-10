from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional

from services.openai_client import stream_completion

router = APIRouter()

CHAT_PROMPT = """You are an expert CFA tutor. The student is working on this practice question:

---
Question: {question_text}

Choices:
  A) {choice_a}
  B) {choice_b}
  C) {choice_c}

Correct Answer: {correct_answer}
Explanation: {explanation}
---

Be concise, pedagogical, and use formulas where relevant. If the student has answered, acknowledge whether they were right or wrong before explaining.

Conversation so far:
{history}

Student: {user_message}
Tutor:"""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question_text: str
    choice_a: str
    choice_b: str
    choice_c: str
    correct_answer: str
    explanation: str
    history: List[ChatMessage] = []
    user_message: str


@router.post("/chat")
async def chat(req: ChatRequest):
    history_str = "\n".join(
        f"{'Student' if m.role == 'user' else 'Tutor'}: {m.content}"
        for m in req.history[-6:]
    )

    prompt = CHAT_PROMPT.format(
        question_text=req.question_text,
        choice_a=req.choice_a,
        choice_b=req.choice_b,
        choice_c=req.choice_c,
        correct_answer=req.correct_answer,
        explanation=req.explanation,
        history=history_str or "(no prior conversation)",
        user_message=req.user_message,
    )

    return StreamingResponse(
        stream_completion(prompt),
        media_type="text/plain; charset=utf-8",
    )
