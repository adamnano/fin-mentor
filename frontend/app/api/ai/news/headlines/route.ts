export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch("http://localhost:8000/news/headlines", {
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data);
}
