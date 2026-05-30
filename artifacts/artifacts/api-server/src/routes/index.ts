import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quizzesRouter from "./quizzes";
import questionsRouter from "./questions";
import sessionsRouter from "./sessions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quizzesRouter);
router.use(questionsRouter);
router.use(sessionsRouter);

export default router;
