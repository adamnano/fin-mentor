export const dynamic = "force-dynamic";

export const metadata = {
  title: "TABF FinMentor · Stats",
};

import { db } from "@/lib/db";
import { userSessions, userScores } from "@/lib/db/schema";
import { sql, desc, gte, isNotNull } from "drizzle-orm";
import StatsPanel from "@/components/StatsPanel";

export default async function StatsPage() {
  try {
    const scores = await db.select().from(userScores);

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

    const timeByCategory = await db
      .select({
        category: userSessions.category,
        avgSeconds: sql<number>`ROUND(AVG(time_spent_seconds))::int`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(userSessions)
      .where(isNotNull(userSessions.timeSpentSeconds))
      .groupBy(userSessions.category);

    const recentSessions = await db
      .select({
        isCorrect: userSessions.isCorrect,
        category: userSessions.category,
        createdAt: userSessions.createdAt,
      })
      .from(userSessions)
      .orderBy(desc(userSessions.createdAt))
      .limit(100);

    const [totals] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        correct: sql<number>`SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int`,
        avgTime: sql<number>`ROUND(AVG(CASE WHEN time_spent_seconds IS NOT NULL THEN time_spent_seconds END))::int`,
      })
      .from(userSessions);

    const data = {
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
    };

    return <StatsPanel data={data} />;
  } catch {
    return <StatsPanel data={null} />;
  }
}
