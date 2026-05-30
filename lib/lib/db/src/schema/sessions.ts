import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { quizzesTable, questionsTable } from "./quizzes";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  totalScore: real("total_score").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, startedAt: true, totalScore: true, completedAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;

export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  initialGuess: text("initial_guess"),
  hintViewed: boolean("hint_viewed").notNull().default(false),
  finalAnswer: text("final_answer"),
  penaltyApplied: boolean("penalty_applied").notNull().default(false),
  score: real("score").notNull().default(0),
  isCorrect: boolean("is_correct"),
});

export const insertAnswerSchema = createInsertSchema(answersTable).omit({ id: true });
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answersTable.$inferSelect;
