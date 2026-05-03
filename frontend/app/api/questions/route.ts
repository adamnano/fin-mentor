import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const categories = searchParams.get("categories");

  try {
    const conditions = [];

    if (category) {
      conditions.push(eq(questions.category, category));
    } else if (categories) {
      const cats = categories.split(",").filter(Boolean);
      if (cats.length > 0) {
        conditions.push(inArray(questions.category, cats));
      }
    }

    if (level) {
      conditions.push(eq(questions.level, parseInt(level)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select()
      .from(questions)
      .where(where)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (result.length === 0) {
      const fallback = await db
        .select()
        .from(questions)
        .orderBy(sql`RANDOM()`)
        .limit(1);
      return NextResponse.json({ source: "db", ...fallback[0] });
    }

    return NextResponse.json({ source: "db", ...result[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}
