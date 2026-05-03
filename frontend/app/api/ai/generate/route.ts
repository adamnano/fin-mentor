import { NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${PYTHON_BACKEND_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Fallback to DB question when AI generation fails
      const { searchParams } = new URL(request.url);
      const fallback = await fetch(
        `${request.url.replace("/api/ai/generate", "/api/questions")}?category=${body.category}&level=${body.level}`,
        { method: "GET" }
      );
      const dbQuestion = await fallback.json();
      return NextResponse.json({ ...dbQuestion, source: "db" });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "AI generation failed. Is the Python backend running?" },
      { status: 503 }
    );
  }
}
