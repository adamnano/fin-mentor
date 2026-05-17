import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions, userScores } from "@/lib/db/schema";
import { sql, desc, gte, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scores = await db.select().from(userScores);

    // Daily activity for the last 91 days (heatmap)
    const cutoff = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
    const dailySessions = await db
      .select({
        date: sql<string>`DATE(created_at)::text`,
        count: sql<number>`COUNT(*)::int`,
        correct: sql<number>`SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int`,
      })
      .from(userSessions)
      .where(gte(userSessions.createdAt, cutoff))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // Avg time per category
    const timeByCategory = await db
      .select({
        category: userSessions.category,
        avgSeconds: sql<number>`ROUND(AVG(time_spent_seconds))::int`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(userSessions)
      .where(isNotNull(userSessions.timeSpentSeconds))
      .groupBy(userSessions.category);

    // Most recent 100 sessions for trend chart
    const recentSessions = await db
      .select({
        isCorrect: userSessions.isCorrect,
        category: userSessions.category,
        createdAt: userSessions.createdAt,
      })
      .from(userSessions)
      .orderBy(desc(userSessions.createdAt))
      .limit(100);

    // Totals
    const [totals] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        correct: sql<number>`SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int`,
        avgTime: sql<number>`ROUND(AVG(CASE WHEN time_spent_seconds IS NOT NULL THEN time_spent_seconds END))::int`,
      })
      .from(userSessions);

    return NextResponse.json({
      scores,
      dailySessions,
      timeByCategory,
      recentSessions: recentSessions.map((s) => ({
        ...s,
        createdAt: s.createdAt?.toISOString() ?? null,
      })),
      totalSessions: totals?.total ?? 0,
      totalCorrect: totals?.correct ?? 0,
      avgTimeSeconds: totals?.avgTime ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
