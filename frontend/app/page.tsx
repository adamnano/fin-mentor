import { db } from "@/lib/db";
import { userScores } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import AppShell from "@/components/AppShell";

export default async function Home() {
  const scores = await db.select().from(userScores).orderBy(asc(userScores.category));
  return <AppShell initialScores={scores} />;
}
