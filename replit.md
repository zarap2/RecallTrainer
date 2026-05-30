# QuizApp

A full-stack quiz platform where instructors manually create multiple-choice quizzes and students take them under a structured scoring system.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (routes at `/api/*`)
- DB: PostgreSQL + Drizzle ORM
- Frontend: React + Vite + TanStack Query + Wouter routing + shadcn/ui
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema: `quizzes.ts` (quizzesTable, questionsTable), `sessions.ts` (sessionsTable, answersTable)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all API types)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit manually)
- `lib/api-zod/src/generated/` — generated Zod schemas for server validation (do not edit manually)
- `artifacts/api-server/src/routes/` — Express route handlers: `quizzes.ts`, `questions.ts`, `sessions.ts`
- `artifacts/quiz-app/src/pages/` — React page components
- `artifacts/quiz-app/src/index.css` — theme (navy/slate CSS variables, light + dark mode)

## Architecture decisions

- Contract-first: OpenAPI spec drives codegen for both React Query hooks (client) and Zod schemas (server validation)
- Scoring logic lives entirely on the server (`sessions.ts` route): penalty flag stored per answer row, score computed on `final-answer` submission
- Quiz questions cascade-delete when a quiz is deleted (FK constraint)
- `completeSession` endpoint sums all answer scores and stamps `completedAt` — leaderboard only shows completed sessions
- No AI features — instructors enter all content manually

## Product

- **Instructors** create quizzes with title/topic/description, add multiple-choice questions (text, 4 choices, correct answer, hint), and view per-quiz stats and leaderboard
- **Students** browse available quizzes, enter their name, and take a quiz question-by-question:
  1. Submit an initial guess
  2. Optionally view a hint (−0.5 penalty if no guess yet; no penalty if initial guess was correct)
  3. Submit a final answer
- After all questions, session is completed and student sees a full score breakdown
- Leaderboard ranks all completed sessions by score

## Scoring rules

| Situation | Score |
|---|---|
| Correct final answer, no hint | +1 |
| Correct final answer, hint viewed after initial guess | +1 |
| Correct final answer, hint viewed before any guess | +0.5 |
| Wrong final answer | +0 |

## User preferences

- No AI question generation — instructors input everything manually
- No emojis in the UI

## Gotchas

- After changing the OpenAPI spec, always run `pnpm --filter @workspace/api-spec run codegen` before editing routes or frontend hooks
- Do not run `pnpm dev` at workspace root — use `restart_workflow` instead
- `pnpm --filter @workspace/quiz-app run typecheck` to check frontend without needing PORT/BASE_PATH

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
