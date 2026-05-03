import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions, userScores } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

interface SessionBody {
  questionId?: number;
  selectedAnswer: string;
  isCorrect: boolean;
  category: string;
  level: number;
  timeSpentSeconds?: number;
}

export async function POST(request: Request) {
  try {
    const body: SessionBody = await request.json();
    const { questionId, selectedAnswer, isCorrect, category, level, timeSpentSeconds } = body;

    await db.transaction(async (tx) => {
      await tx.insert(userSessions).values({
        questionId: questionId ?? null,
        selectedAnswer,
        isCorrect,
        category,
        level,
        timeSpentSeconds: timeSpentSeconds ?? null,
      });

      await tx
        .insert(userScores)
        .values({
          category,
          level,
          totalAttempts: 1,
          correctCount: isCorrect ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: [userScores.category, userScores.level],
          set: {
            totalAttempts: sql`user_scores.total_attempts + 1`,
            correctCount: isCorrect
              ? sql`user_scores.correct_count + 1`
              : sql`user_scores.correct_count`,
            lastUpdated: sql`NOW()`,
          },
        });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
