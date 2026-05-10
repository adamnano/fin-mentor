const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(`${PYTHON_BACKEND_URL}/news/headlines`, {
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data);
}
