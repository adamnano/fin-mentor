const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/news/discuss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!pythonResponse.ok) {
      return new Response("News discussion service unavailable", { status: 503 });
    }

    return new Response(pythonResponse.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response("Discussion service error", { status: 500 });
  }
}
