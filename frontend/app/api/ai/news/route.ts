import { NextRequest } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pythonRes = await fetch(`${PYTHON_BACKEND_URL}/news/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!pythonRes.ok) {
    return new Response(JSON.stringify({ error: "News analysis failed" }), { status: 500 });
  }
  return new Response(pythonRes.body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
}
