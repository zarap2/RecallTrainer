import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Answer, ApiError, FinalAnswerInput, GuessInput, HealthStatus, HintRequest, HintResponse, LeaderboardEntry, Question, QuestionInput, QuestionUpdate, Quiz, QuizInput, QuizStats, QuizSummary, QuizUpdate, Session, SessionInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListQuizzesUrl: () => string;
/**
 * @summary List all quizzes
 */
export declare const listQuizzes: (options?: RequestInit) => Promise<QuizSummary[]>;
export declare const getListQuizzesQueryKey: () => readonly ["/api/quizzes"];
export declare const getListQuizzesQueryOptions: <TData = Awaited<ReturnType<typeof listQuizzes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuizzesQueryResult = NonNullable<Awaited<ReturnType<typeof listQuizzes>>>;
export type ListQuizzesQueryError = ErrorType<unknown>;
/**
 * @summary List all quizzes
 */
export declare function useListQuizzes<TData = Awaited<ReturnType<typeof listQuizzes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateQuizUrl: () => string;
/**
 * @summary Create a new quiz
 */
export declare const createQuiz: (quizInput: QuizInput, options?: RequestInit) => Promise<Quiz>;
export declare const getCreateQuizMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuiz>>, TError, {
        data: BodyType<QuizInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createQuiz>>, TError, {
    data: BodyType<QuizInput>;
}, TContext>;
export type CreateQuizMutationResult = NonNullable<Awaited<ReturnType<typeof createQuiz>>>;
export type CreateQuizMutationBody = BodyType<QuizInput>;
export type CreateQuizMutationError = ErrorType<unknown>;
/**
* @summary Create a new quiz
*/
export declare const useCreateQuiz: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuiz>>, TError, {
        data: BodyType<QuizInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createQuiz>>, TError, {
    data: BodyType<QuizInput>;
}, TContext>;
export declare const getGetQuizUrl: (id: number) => string;
/**
 * @summary Get a quiz with its questions
 */
export declare const getQuiz: (id: number, options?: RequestInit) => Promise<Quiz>;
export declare const getGetQuizQueryKey: (id: number) => readonly [`/api/quizzes/${number}`];
export declare const getGetQuizQueryOptions: <TData = Awaited<ReturnType<typeof getQuiz>>, TError = ErrorType<ApiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQuizQueryResult = NonNullable<Awaited<ReturnType<typeof getQuiz>>>;
export type GetQuizQueryError = ErrorType<ApiError>;
/**
 * @summary Get a quiz with its questions
 */
export declare function useGetQuiz<TData = Awaited<ReturnType<typeof getQuiz>>, TError = ErrorType<ApiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateQuizUrl: (id: number) => string;
/**
 * @summary Update a quiz
 */
export declare const updateQuiz: (id: number, quizUpdate: QuizUpdate, options?: RequestInit) => Promise<Quiz>;
export declare const getUpdateQuizMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuiz>>, TError, {
        id: number;
        data: BodyType<QuizUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateQuiz>>, TError, {
    id: number;
    data: BodyType<QuizUpdate>;
}, TContext>;
export type UpdateQuizMutationResult = NonNullable<Awaited<ReturnType<typeof updateQuiz>>>;
export type UpdateQuizMutationBody = BodyType<QuizUpdate>;
export type UpdateQuizMutationError = ErrorType<ApiError>;
/**
* @summary Update a quiz
*/
export declare const useUpdateQuiz: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuiz>>, TError, {
        id: number;
        data: BodyType<QuizUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateQuiz>>, TError, {
    id: number;
    data: BodyType<QuizUpdate>;
}, TContext>;
export declare const getDeleteQuizUrl: (id: number) => string;
/**
 * @summary Delete a quiz
 */
export declare const deleteQuiz: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteQuizMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuiz>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteQuiz>>, TError, {
    id: number;
}, TContext>;
export type DeleteQuizMutationResult = NonNullable<Awaited<ReturnType<typeof deleteQuiz>>>;
export type DeleteQuizMutationError = ErrorType<ApiError>;
/**
* @summary Delete a quiz
*/
export declare const useDeleteQuiz: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuiz>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteQuiz>>, TError, {
    id: number;
}, TContext>;
export declare const getAddQuestionUrl: (id: number) => string;
/**
 * @summary Add a question to a quiz
 */
export declare const addQuestion: (id: number, questionInput: QuestionInput, options?: RequestInit) => Promise<Question>;
export declare const getAddQuestionMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addQuestion>>, TError, {
        id: number;
        data: BodyType<QuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addQuestion>>, TError, {
    id: number;
    data: BodyType<QuestionInput>;
}, TContext>;
export type AddQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof addQuestion>>>;
export type AddQuestionMutationBody = BodyType<QuestionInput>;
export type AddQuestionMutationError = ErrorType<ApiError>;
/**
* @summary Add a question to a quiz
*/
export declare const useAddQuestion: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addQuestion>>, TError, {
        id: number;
        data: BodyType<QuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addQuestion>>, TError, {
    id: number;
    data: BodyType<QuestionInput>;
}, TContext>;
export declare const getGetQuizStatsUrl: (id: number) => string;
/**
 * @summary Get stats for a quiz
 */
export declare const getQuizStats: (id: number, options?: RequestInit) => Promise<QuizStats>;
export declare const getGetQuizStatsQueryKey: (id: number) => readonly [`/api/quizzes/${number}/stats`];
export declare const getGetQuizStatsQueryOptions: <TData = Awaited<ReturnType<typeof getQuizStats>>, TError = ErrorType<ApiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuizStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQuizStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQuizStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getQuizStats>>>;
export type GetQuizStatsQueryError = ErrorType<ApiError>;
/**
 * @summary Get stats for a quiz
 */
export declare function useGetQuizStats<TData = Awaited<ReturnType<typeof getQuizStats>>, TError = ErrorType<ApiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuizStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetQuizLeaderboardUrl: (id: number) => string;
/**
 * @summary Get leaderboard for a quiz
 */
export declare const getQuizLeaderboard: (id: number, options?: RequestInit) => Promise<LeaderboardEntry[]>;
export declare const getGetQuizLeaderboardQueryKey: (id: number) => readonly [`/api/quizzes/${number}/leaderboard`];
export declare const getGetQuizLeaderboardQueryOptions: <TData = Awaited<ReturnType<typeof getQuizLeaderboard>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuizLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQuizLeaderboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQuizLeaderboardQueryResult = NonNullable<Awaited<ReturnType<typeof getQuizLeaderboard>>>;
export type GetQuizLeaderboardQueryError = ErrorType<unknown>;
/**
 * @summary Get leaderboard for a quiz
 */
export declare function useGetQuizLeaderboard<TData = Awaited<ReturnType<typeof getQuizLeaderboard>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuizLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateQuestionUrl: (id: number) => string;
/**
 * @summary Update a question
 */
export declare const updateQuestion: (id: number, questionUpdate: QuestionUpdate, options?: RequestInit) => Promise<Question>;
export declare const getUpdateQuestionMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
        id: number;
        data: BodyType<QuestionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
    id: number;
    data: BodyType<QuestionUpdate>;
}, TContext>;
export type UpdateQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof updateQuestion>>>;
export type UpdateQuestionMutationBody = BodyType<QuestionUpdate>;
export type UpdateQuestionMutationError = ErrorType<ApiError>;
/**
* @summary Update a question
*/
export declare const useUpdateQuestion: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
        id: number;
        data: BodyType<QuestionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateQuestion>>, TError, {
    id: number;
    data: BodyType<QuestionUpdate>;
}, TContext>;
export declare const getDeleteQuestionUrl: (id: number) => string;
/**
 * @summary Delete a question
 */
export declare const deleteQuestion: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteQuestionMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
    id: number;
}, TContext>;
export type DeleteQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteQuestion>>>;
export type DeleteQuestionMutationError = ErrorType<ApiError>;
/**
* @summary Delete a question
*/
export declare const useDeleteQuestion: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
    id: number;
}, TContext>;
export declare const getCreateSessionUrl: () => string;
/**
 * @summary Start a quiz session (student begins a quiz)
 */
export declare const createSession: (sessionInput: SessionInput, options?: RequestInit) => Promise<Session>;
export declare const getCreateSessionMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSession>>, TError, {
        data: BodyType<SessionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSession>>, TError, {
    data: BodyType<SessionInput>;
}, TContext>;
export type CreateSessionMutationResult = NonNullable<Awaited<ReturnType<typeof createSession>>>;
export type CreateSessionMutationBody = BodyType<SessionInput>;
export type CreateSessionMutationError = ErrorType<ApiError>;
/**
* @summary Start a quiz session (student begins a quiz)
*/
export declare const useCreateSession: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSession>>, TError, {
        data: BodyType<SessionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSession>>, TError, {
    data: BodyType<SessionInput>;
}, TContext>;
export declare const getGetSessionUrl: (id: number) => string;
/**
 * @summary Get session state and answers
 */
export declare const getSession: (id: number, options?: RequestInit) => Promise<Session>;
export declare const getGetSessionQueryKey: (id: number) => readonly [`/api/sessions/${number}`];
export declare const getGetSessionQueryOptions: <TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<ApiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type GetSessionQueryError = ErrorType<ApiError>;
/**
 * @summary Get session state and answers
 */
export declare function useGetSession<TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<ApiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSubmitInitialGuessUrl: (id: number) => string;
/**
 * @summary Submit initial guess for a question
 */
export declare const submitInitialGuess: (id: number, guessInput: GuessInput, options?: RequestInit) => Promise<Answer>;
export declare const getSubmitInitialGuessMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitInitialGuess>>, TError, {
        id: number;
        data: BodyType<GuessInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitInitialGuess>>, TError, {
    id: number;
    data: BodyType<GuessInput>;
}, TContext>;
export type SubmitInitialGuessMutationResult = NonNullable<Awaited<ReturnType<typeof submitInitialGuess>>>;
export type SubmitInitialGuessMutationBody = BodyType<GuessInput>;
export type SubmitInitialGuessMutationError = ErrorType<ApiError>;
/**
* @summary Submit initial guess for a question
*/
export declare const useSubmitInitialGuess: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitInitialGuess>>, TError, {
        id: number;
        data: BodyType<GuessInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitInitialGuess>>, TError, {
    id: number;
    data: BodyType<GuessInput>;
}, TContext>;
export declare const getViewHintUrl: (id: number) => string;
/**
 * @summary View hint for a question (records penalty if no initial guess)
 */
export declare const viewHint: (id: number, hintRequest: HintRequest, options?: RequestInit) => Promise<HintResponse>;
export declare const getViewHintMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof viewHint>>, TError, {
        id: number;
        data: BodyType<HintRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof viewHint>>, TError, {
    id: number;
    data: BodyType<HintRequest>;
}, TContext>;
export type ViewHintMutationResult = NonNullable<Awaited<ReturnType<typeof viewHint>>>;
export type ViewHintMutationBody = BodyType<HintRequest>;
export type ViewHintMutationError = ErrorType<ApiError>;
/**
* @summary View hint for a question (records penalty if no initial guess)
*/
export declare const useViewHint: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof viewHint>>, TError, {
        id: number;
        data: BodyType<HintRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof viewHint>>, TError, {
    id: number;
    data: BodyType<HintRequest>;
}, TContext>;
export declare const getSubmitFinalAnswerUrl: (id: number) => string;
/**
 * @summary Submit final answer for a question
 */
export declare const submitFinalAnswer: (id: number, finalAnswerInput: FinalAnswerInput, options?: RequestInit) => Promise<Answer>;
export declare const getSubmitFinalAnswerMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitFinalAnswer>>, TError, {
        id: number;
        data: BodyType<FinalAnswerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitFinalAnswer>>, TError, {
    id: number;
    data: BodyType<FinalAnswerInput>;
}, TContext>;
export type SubmitFinalAnswerMutationResult = NonNullable<Awaited<ReturnType<typeof submitFinalAnswer>>>;
export type SubmitFinalAnswerMutationBody = BodyType<FinalAnswerInput>;
export type SubmitFinalAnswerMutationError = ErrorType<ApiError>;
/**
* @summary Submit final answer for a question
*/
export declare const useSubmitFinalAnswer: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitFinalAnswer>>, TError, {
        id: number;
        data: BodyType<FinalAnswerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitFinalAnswer>>, TError, {
    id: number;
    data: BodyType<FinalAnswerInput>;
}, TContext>;
export declare const getCompleteSessionUrl: (id: number) => string;
/**
 * @summary Mark session as complete and compute final score
 */
export declare const completeSession: (id: number, options?: RequestInit) => Promise<Session>;
export declare const getCompleteSessionMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeSession>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof completeSession>>, TError, {
    id: number;
}, TContext>;
export type CompleteSessionMutationResult = NonNullable<Awaited<ReturnType<typeof completeSession>>>;
export type CompleteSessionMutationError = ErrorType<ApiError>;
/**
* @summary Mark session as complete and compute final score
*/
export declare const useCompleteSession: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeSession>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof completeSession>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map