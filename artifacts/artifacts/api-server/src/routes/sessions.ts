import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, quizzesTable, questionsTable, sessionsTable, answersTable } from "@workspace/db";
import {
  CreateSessionBody,
  GetSessionParams,
  SubmitInitialGuessParams,
  SubmitInitialGuessBody,
  ViewHintParams,
  ViewHintBody,
  SubmitFinalAnswerParams,
  SubmitFinalAnswerBody,
  CompleteSessionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatSession(session: typeof sessionsTable.$inferSelect, answers: typeof answersTable.$inferSelect[]) {
  return {
    ...session,
    completedAt: session.completedAt ? session.completedAt.toISOString() : null,
    startedAt: session.startedAt.toISOString(),
    answers: answers.map((a) => ({
      ...a,
      initialGuess: a.initialGuess ?? null,
      finalAnswer: a.finalAnswer ?? null,
      isCorrect: a.isCorrect ?? null,
    })),
  };
}

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, parsed.data.quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const [session] = await db
    .insert(sessionsTable)
    .values({ quizId: parsed.data.quizId, studentName: parsed.data.studentName })
    .returning();
  res.status(201).json(formatSession(session, []));
});

router.get("/sessions/:id", async (req, res): Promise<void> => {
  const params = GetSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, params.data.id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const answers = await db.select().from(answersTable).where(eq(answersTable.sessionId, params.data.id));
  res.json(formatSession(session, answers));
});

router.post("/sessions/:id/initial-guess", async (req, res): Promise<void> => {
  const params = SubmitInitialGuessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SubmitInitialGuessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, params.data.id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (session.completedAt) {
    res.status(400).json({ error: "Session already completed" });
    return;
  }
  const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, parsed.data.questionId));
  if (!question || question.quizId !== session.quizId) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  // Find or create an answer record
  let [existing] = await db
    .select()
    .from(answersTable)
    .where(and(eq(answersTable.sessionId, params.data.id), eq(answersTable.questionId, parsed.data.questionId)));

  if (existing?.initialGuess != null) {
    res.status(400).json({ error: "Initial guess already submitted for this question" });
    return;
  }

  if (existing) {
    const [updated] = await db
      .update(answersTable)
      .set({ initialGuess: parsed.data.guess })
      .where(eq(answersTable.id, existing.id))
      .returning();
    res.json({ ...updated, initialGuess: updated.initialGuess ?? null, finalAnswer: updated.finalAnswer ?? null, isCorrect: updated.isCorrect ?? null });
  } else {
    const [created] = await db
      .insert(answersTable)
      .values({ sessionId: params.data.id, questionId: parsed.data.questionId, initialGuess: parsed.data.guess })
      .returning();
    res.json({ ...created, initialGuess: created.initialGuess ?? null, finalAnswer: created.finalAnswer ?? null, isCorrect: created.isCorrect ?? null });
  }
});

router.post("/sessions/:id/view-hint", async (req, res): Promise<void> => {
  const params = ViewHintParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ViewHintBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, params.data.id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (session.completedAt) {
    res.status(400).json({ error: "Session already completed" });
    return;
  }
  const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, parsed.data.questionId));
  if (!question || question.quizId !== session.quizId) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  let [existing] = await db
    .select()
    .from(answersTable)
    .where(and(eq(answersTable.sessionId, params.data.id), eq(answersTable.questionId, parsed.data.questionId)));

  // Penalty applies if hint viewed before making any initial guess
  // Also: if initial guess was correct, no penalty even when hint is viewed
  const initialGuessCorrect = existing?.initialGuess != null && existing.initialGuess === question.correctAnswer;
  const noInitialGuess = !existing?.initialGuess;
  const shouldPenalize = noInitialGuess && !existing?.hintViewed;

  if (existing) {
    if (!existing.hintViewed) {
      const [updated] = await db
        .update(answersTable)
        .set({
          hintViewed: true,
          penaltyApplied: shouldPenalize,
        })
        .where(eq(answersTable.id, existing.id))
        .returning();
      existing = updated;
    }
  } else {
    const [created] = await db
      .insert(answersTable)
      .values({
        sessionId: params.data.id,
        questionId: parsed.data.questionId,
        hintViewed: true,
        penaltyApplied: true,
      })
      .returning();
    existing = created;
  }

  res.json({
    hint: question.hint,
    answer: {
      ...existing,
      initialGuess: existing.initialGuess ?? null,
      finalAnswer: existing.finalAnswer ?? null,
      isCorrect: existing.isCorrect ?? null,
    },
  });
});

router.post("/sessions/:id/final-answer", async (req, res): Promise<void> => {
  const params = SubmitFinalAnswerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SubmitFinalAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, params.data.id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (session.completedAt) {
    res.status(400).json({ error: "Session already completed" });
    return;
  }
  const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, parsed.data.questionId));
  if (!question || question.quizId !== session.quizId) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  let [existing] = await db
    .select()
    .from(answersTable)
    .where(and(eq(answersTable.sessionId, params.data.id), eq(answersTable.questionId, parsed.data.questionId)));

  if (existing?.finalAnswer != null) {
    res.status(400).json({ error: "Final answer already submitted for this question" });
    return;
  }

  const isCorrect = parsed.data.answer === question.correctAnswer;
  // Score: 1 if correct, minus 0.5 penalty if penalty applies, else 0
  let score = 0;
  if (isCorrect) {
    score = existing?.penaltyApplied ? 0.5 : 1;
  }

  if (existing) {
    const [updated] = await db
      .update(answersTable)
      .set({ finalAnswer: parsed.data.answer, isCorrect, score })
      .where(eq(answersTable.id, existing.id))
      .returning();
    res.json({ ...updated, initialGuess: updated.initialGuess ?? null, finalAnswer: updated.finalAnswer ?? null, isCorrect: updated.isCorrect ?? null });
  } else {
    const [created] = await db
      .insert(answersTable)
      .values({
        sessionId: params.data.id,
        questionId: parsed.data.questionId,
        finalAnswer: parsed.data.answer,
        isCorrect,
        score,
      })
      .returning();
    res.json({ ...created, initialGuess: created.initialGuess ?? null, finalAnswer: created.finalAnswer ?? null, isCorrect: created.isCorrect ?? null });
  }
});

router.post("/sessions/:id/complete", async (req, res): Promise<void> => {
  const params = CompleteSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, params.data.id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const answers = await db.select().from(answersTable).where(eq(answersTable.sessionId, params.data.id));
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const [updated] = await db
    .update(sessionsTable)
    .set({ completedAt: new Date(), totalScore })
    .where(eq(sessionsTable.id, params.data.id))
    .returning();
  res.json(formatSession(updated, answers));
});

export default router;
