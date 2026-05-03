import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userScores } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const scores = await db
      .select()
      .from(userScores)
      .orderBy(asc(userScores.category));
    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
