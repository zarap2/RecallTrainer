import { useParams } from "wouter";
import { Link } from "wouter";
import { useGetSession, getGetSessionQueryKey, useGetQuiz, getGetQuizQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle2, XCircle, Lightbulb, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SessionResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const id = parseInt(sessionId ?? "0", 10);

  const { data: session, isLoading: sessionLoading } = useGetSession(id, {
    query: { enabled: !!id, queryKey: getGetSessionQueryKey(id) },
  });

  const quizId = session?.quizId ?? 0;
  const { data: quiz } = useGetQuiz(quizId, {
    query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) },
  });

  if (sessionLoading || !session || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxScore = quiz.questions.length;
  const pct = maxScore > 0 ? Math.round((session.totalScore / maxScore) * 100) : 0;

  const getGrade = () => {
    if (pct >= 90) return { label: "Excellent", color: "text-green-600" };
    if (pct >= 75) return { label: "Good", color: "text-blue-600" };
    if (pct >= 60) return { label: "Passing", color: "text-amber-600" };
    return { label: "Needs Improvement", color: "text-red-600" };
  };
  const grade = getGrade();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-bold font-serif">QuizApp</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-serif">Quiz Complete!</CardTitle>
            <p className="text-muted-foreground">{session.studentName} · {quiz.title}</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-12 py-4">
              <div>
                <p className="text-4xl font-bold text-primary">
                  {session.totalScore}<span className="text-xl text-muted-foreground font-normal">/{maxScore}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Score</p>
              </div>
              <div>
                <p className={cn("text-4xl font-bold", grade.color)}>{pct}%</p>
                <p className="text-sm text-muted-foreground mt-1">{grade.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold font-serif">Question Breakdown</h2>
          {quiz.questions.map((question, index) => {
            const answer = session.answers.find((a) => a.questionId === question.id);
            const isCorrect = answer?.isCorrect;
            const score = answer?.score ?? 0;

            return (
              <Card key={question.id} className={cn(
                "border",
                isCorrect === true ? "border-green-200 bg-green-50/40" :
                isCorrect === false ? "border-red-200 bg-red-50/30" :
                "border-border"
              )}>
                <CardContent className="py-4">
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0 mt-0.5">
                      {isCorrect === true
                        ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                        : isCorrect === false
                        ? <XCircle className="w-5 h-5 text-red-500" />
                        : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                        {question.text}
                      </p>
                      {answer?.finalAnswer && (
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <p>
                            Your answer: <span className={cn("font-medium", isCorrect ? "text-green-700" : "text-red-600")}>{answer.finalAnswer}</span>
                          </p>
                          {!isCorrect && (
                            <p>Correct: <span className="font-medium text-green-700">{question.correctAnswer}</span></p>
                          )}
                          {answer.hintViewed && (
                            <p className="flex items-center gap-1">
                              <Lightbulb className="w-3 h-3 text-amber-500" />
                              Hint used{answer.penaltyApplied ? " (−0.5 penalty)" : " (no penalty — guessed first)"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={cn(
                        "text-sm font-bold",
                        score > 0 ? "text-green-700" : "text-muted-foreground"
                      )}>
                        {score > 0 ? `+${score}` : "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 pb-8">
          <Link href={`/quiz/${quiz.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Take Again
            </Button>
          </Link>
          <Link href={`/quiz/${quiz.id}/leaderboard`} className="flex-1">
            <Button className="w-full gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
