import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetSession,
  getGetSessionQueryKey,
  useGetQuiz,
  getGetQuizQueryKey,
  useSubmitInitialGuess,
  useViewHint,
  useSubmitFinalAnswer,
  useCompleteSession,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Lightbulb, ChevronRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizPhase = "initial-guess" | "hint-available" | "final-answer" | "done";

export default function ActiveSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const id = parseInt(sessionId ?? "0", 10);

  const { data: session, isLoading: sessionLoading } = useGetSession(id, {
    query: { enabled: !!id, queryKey: getGetSessionQueryKey(id) },
  });

  const quizId = session?.quizId ?? 0;
  const { data: quiz } = useGetQuiz(quizId, {
    query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) },
  });

  const submitInitialGuess = useSubmitInitialGuess();
  const viewHint = useViewHint();
  const submitFinalAnswer = useSubmitFinalAnswer();
  const completeSession = useCompleteSession();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [phase, setPhase] = useState<QuizPhase>("initial-guess");
  const [hintText, setHintText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; score: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const questions = quiz?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (session?.completedAt) {
      setLocation(`/session/${id}/results`);
    }
  }, [session?.completedAt]);

  const refreshSession = () =>
    queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(id) });

  const getCurrentAnswer = () =>
    session?.answers.find((a) => a.questionId === currentQuestion?.id);

  const handleInitialGuess = () => {
    if (!selectedChoice || !currentQuestion) return;
    setErrorMsg(null);
    submitInitialGuess.mutate(
      { id, data: { questionId: currentQuestion.id, guess: selectedChoice } },
      {
        onSuccess: () => {
          refreshSession();
          setPhase("hint-available");
        },
        onError: () => setErrorMsg("Could not submit guess. Try again."),
      }
    );
  };

  const handleSkipHint = () => {
    setPhase("final-answer");
    setSelectedChoice(null);
  };

  const handleViewHint = () => {
    if (!currentQuestion) return;
    setErrorMsg(null);
    viewHint.mutate(
      { id, data: { questionId: currentQuestion.id } },
      {
        onSuccess: (res) => {
          setHintText(res.hint);
          refreshSession();
          setPhase("final-answer");
          setSelectedChoice(null);
        },
        onError: () => setErrorMsg("Could not load hint. Try again."),
      }
    );
  };

  const handleFinalAnswer = () => {
    if (!selectedChoice || !currentQuestion) return;
    setErrorMsg(null);
    submitFinalAnswer.mutate(
      { id, data: { questionId: currentQuestion.id, answer: selectedChoice } },
      {
        onSuccess: (answer) => {
          refreshSession();
          setFeedback({ correct: answer.isCorrect ?? false, score: answer.score });
          setPhase("done");
        },
        onError: () => setErrorMsg("Could not submit answer. Try again."),
      }
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      completeSession.mutate(
        { id },
        {
          onSuccess: () => setLocation(`/session/${id}/results`),
        }
      );
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedChoice(null);
      setPhase("initial-guess");
      setHintText(null);
      setFeedback(null);
      setErrorMsg(null);
    }
  };

  if (sessionLoading || !session || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center p-8">
          <p className="text-muted-foreground">This quiz has no questions yet.</p>
        </Card>
      </div>
    );
  }

  const currentAnswer = getCurrentAnswer();
  const isPending =
    submitInitialGuess.isPending || viewHint.isPending || submitFinalAnswer.isPending || completeSession.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold font-serif">QuizApp</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{session.studentName}</span>
            {" · "}
            {quiz.title}
          </div>
        </div>
      </header>

      <div className="bg-card border-b px-4 py-2">
        <div className="container mx-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <Progress value={progress} className="flex-1 h-2" />
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-2xl space-y-4">
          {currentQuestion && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Question {currentQuestionIndex + 1}
                      </p>
                      <CardTitle className="text-xl font-serif leading-snug">
                        {currentQuestion.text}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentQuestion.choices.map((choice) => {
                    const isSelected = selectedChoice === choice;
                    const isDone = phase === "done";
                    const isCorrect = choice === currentQuestion.correctAnswer;
                    const isFinalSelected = isDone && choice === (currentAnswer?.finalAnswer ?? selectedChoice);

                    return (
                      <button
                        key={choice}
                        data-testid={`choice-${choice}`}
                        onClick={() => !isDone && setSelectedChoice(choice)}
                        disabled={isDone}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all",
                          isDone
                            ? isCorrect
                              ? "bg-green-50 border-green-400 text-green-800"
                              : isFinalSelected && !isCorrect
                              ? "bg-red-50 border-red-300 text-red-700"
                              : "bg-muted/30 border-border text-muted-foreground"
                            : isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card hover:bg-muted/40 border-border hover:border-primary/40"
                        )}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {hintText && (
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="py-3 flex gap-2 items-start">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-0.5">Hint</p>
                      <p className="text-sm text-amber-800">{hintText}</p>
                      {currentAnswer?.penaltyApplied && (
                        <p className="text-xs text-amber-600 mt-1">−0.5 penalty applied (hint viewed before initial guess)</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {feedback && (
                <Card className={cn(
                  "border",
                  feedback.correct ? "bg-green-50 border-green-300" : "bg-red-50 border-red-200"
                )}>
                  <CardContent className="py-3 flex gap-2 items-center">
                    {feedback.correct
                      ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    }
                    <div>
                      <p className={cn("text-sm font-semibold", feedback.correct ? "text-green-800" : "text-red-700")}>
                        {feedback.correct ? "Correct!" : "Incorrect"}
                      </p>
                      <p className={cn("text-xs", feedback.correct ? "text-green-700" : "text-red-600")}>
                        {feedback.score > 0 ? `+${feedback.score} point${feedback.score !== 1 ? "s" : ""}` : "No points earned"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {errorMsg && (
                <Card className="bg-destructive/10 border-destructive/30">
                  <CardContent className="py-3 flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                {phase === "initial-guess" && (
                  <Button
                    className="flex-1"
                    onClick={handleInitialGuess}
                    disabled={!selectedChoice || isPending}
                    data-testid="button-submit-initial-guess"
                  >
                    {isPending ? "Submitting..." : "Submit Initial Guess"}
                  </Button>
                )}

                {phase === "hint-available" && (
                  <>
                    <Button
                      variant="outline"
                      className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={handleViewHint}
                      disabled={isPending}
                      data-testid="button-view-hint"
                    >
                      <Lightbulb className="w-4 h-4" />
                      View Hint (−0.5 if not guessed)
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSkipHint}
                      disabled={isPending}
                      data-testid="button-skip-hint"
                    >
                      Skip Hint, Answer Now
                    </Button>
                  </>
                )}

                {phase === "final-answer" && (
                  <Button
                    className="flex-1"
                    onClick={handleFinalAnswer}
                    disabled={!selectedChoice || isPending}
                    data-testid="button-submit-final-answer"
                  >
                    {isPending ? "Submitting..." : "Submit Final Answer"}
                  </Button>
                )}

                {phase === "done" && (
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleNext}
                    disabled={isPending}
                    data-testid="button-next-question"
                  >
                    {isPending
                      ? "Loading..."
                      : currentQuestionIndex + 1 >= totalQuestions
                      ? "See Results"
                      : "Next Question"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
