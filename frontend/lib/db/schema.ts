import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  level: integer("level").notNull(),
  difficulty: integer("difficulty").notNull(),
  questionText: text("question_text").notNull(),
  choiceA: text("choice_a").notNull(),
  choiceB: text("choice_b").notNull(),
  choiceC: text("choice_c").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  visualizationType: text("visualization_type"),
  visualizationParams: jsonb("visualization_params"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  category: text("category").notNull(),
  level: integer("level").notNull(),
  timeSpentSeconds: integer("time_spent_seconds"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userScores = pgTable(
  "user_scores",
  {
    id: serial("id").primaryKey(),
    category: text("category").notNull(),
    level: integer("level").notNull(),
    totalAttempts: integer("total_attempts").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    lastUpdated: timestamp("last_updated").defaultNow(),
  },
  (table) => ({
    categoryLevelUnique: unique().on(table.category, table.level),
  })
);

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type UserScore = typeof userScores.$inferSelect;
