from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import generate, chat, news

app = FastAPI(title="FinMentor AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router)
app.include_router(chat.router)
app.include_router(news.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
