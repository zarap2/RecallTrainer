import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, questionsTable } from "@workspace/db";
import { UpdateQuestionParams, UpdateQuestionBody, DeleteQuestionParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.patch("/questions/:id", async (req, res): Promise<void> => {
  const params = UpdateQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [question] = await db
    .update(questionsTable)
    .set(parsed.data)
    .where(eq(questionsTable.id, params.data.id))
    .returning();
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(question);
});

router.delete("/questions/:id", async (req, res): Promise<void> => {
  const params = DeleteQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [question] = await db
    .delete(questionsTable)
    .where(eq(questionsTable.id, params.data.id))
    .returning();
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
