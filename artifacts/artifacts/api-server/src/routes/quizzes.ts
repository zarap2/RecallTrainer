import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, quizzesTable, questionsTable, sessionsTable, answersTable } from "@workspace/db";
import {
  CreateQuizBody,
  UpdateQuizParams,
  UpdateQuizBody,
  DeleteQuizParams,
  GetQuizParams,
  GetQuizStatsParams,
  GetQuizLeaderboardParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/quizzes", async (req, res): Promise<void> => {
  const quizzes = await db.select().from(quizzesTable).orderBy(quizzesTable.createdAt);

  const result = await Promise.all(
    quizzes.map(async (quiz) => {
      const [qCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(questionsTable)
        .where(eq(questionsTable.quizId, quiz.id));
      const [sCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sessionsTable)
        .where(eq(sessionsTable.quizId, quiz.id));
      return {
        ...quiz,
        description: quiz.description ?? null,
        questionCount: qCount?.count ?? 0,
        sessionCount: sCount?.count ?? 0,
      };
    })
  );

  res.json(result);
});

router.post("/quizzes", async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db
    .insert(quizzesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json({ ...quiz, description: quiz.description ?? null, questions: [] });
});

router.get("/quizzes/:id", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.quizId, quiz.id))
    .orderBy(questionsTable.orderIndex);
  res.json({ ...quiz, description: quiz.description ?? null, questions });
});

router.patch("/quizzes/:id", async (req, res): Promise<void> => {
  const params = UpdateQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db
    .update(quizzesTable)
    .set(parsed.data)
    .where(eq(quizzesTable.id, params.data.id))
    .returning();
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.quizId, quiz.id))
    .orderBy(questionsTable.orderIndex);
  res.json({ ...quiz, description: quiz.description ?? null, questions });
});

router.delete("/quizzes/:id", async (req, res): Promise<void> => {
  const params = DeleteQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [quiz] = await db.delete(quizzesTable).where(eq(quizzesTable.id, params.data.id)).returning();
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/quizzes/:id/questions", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const { AddQuestionBody } = await import("@workspace/api-zod");
  const parsed = AddQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [question] = await db
    .insert(questionsTable)
    .values({ ...parsed.data, quizId: params.data.id })
    .returning();
  res.status(201).json(question);
});

router.get("/quizzes/:id/stats", async (req, res): Promise<void> => {
  const params = GetQuizStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.quizId, params.data.id));
  const sessionCount = sessions.length;
  const completedSessions = sessions.filter((s) => s.completedAt !== null);
  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.totalScore, 0) / completedSessions.length
      : 0;
  const completionRate = sessionCount > 0 ? completedSessions.length / sessionCount : 0;

  const allAnswers = await db
    .select()
    .from(answersTable)
    .where(
      sql`${answersTable.sessionId} IN (SELECT id FROM sessions WHERE quiz_id = ${params.data.id})`
    );
  const avgHintUsage =
    allAnswers.length > 0 ? allAnswers.filter((a) => a.hintViewed).length / allAnswers.length : 0;

  res.json({
    quizId: params.data.id,
    sessionCount,
    avgScore: Math.round(avgScore * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    avgHintUsage: Math.round(avgHintUsage * 100) / 100,
  });
});

router.get("/quizzes/:id/leaderboard", async (req, res): Promise<void> => {
  const params = GetQuizLeaderboardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.quizId, params.data.id))
    .orderBy(sql`total_score DESC, completed_at ASC`);
  const completed = sessions.filter((s) => s.completedAt !== null);
  const leaderboard = completed.map((s, i) => ({
    rank: i + 1,
    studentName: s.studentName,
    totalScore: s.totalScore,
    completedAt: s.completedAt!.toISOString(),
  }));
  res.json(leaderboard);
});

export default router;
