import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pythonRes = await fetch("http://localhost:8000/news/analyze", {
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
