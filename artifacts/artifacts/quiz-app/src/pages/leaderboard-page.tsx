import { useParams } from "wouter";
import { Link } from "wouter";
import {
  useGetQuiz, getGetQuizQueryKey,
  useGetQuizLeaderboard, getGetQuizLeaderboardQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronLeft, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const medalColors = ["text-amber-400", "text-slate-400", "text-amber-600"];

export default function LeaderboardPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const id = parseInt(quizId ?? "0", 10);

  const { data: quiz } = useGetQuiz(id, {
    query: { enabled: !!id, queryKey: getGetQuizQueryKey(id) },
  });
  const { data: entries, isLoading } = useGetQuizLeaderboard(id, {
    query: { enabled: !!id, queryKey: getGetQuizLeaderboardQueryKey(id) },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/quiz/${id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold font-serif">QuizApp</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-serif">Leaderboard</h1>
          {quiz && <p className="text-muted-foreground mt-1">{quiz.title}</p>}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : !entries || entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No completed sessions yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Be the first to take this quiz!</p>
              <Link href={`/quiz/${id}`}>
                <Button className="mt-4">Take Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card
                key={`${entry.rank}-${entry.studentName}`}
                className={cn(
                  "border",
                  entry.rank === 1 && "border-amber-200 bg-amber-50/40",
                  entry.rank === 2 && "border-slate-200 bg-slate-50/40",
                  entry.rank === 3 && "border-amber-100 bg-amber-50/20",
                )}
                data-testid={`leaderboard-entry-${entry.rank}`}
              >
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="w-8 text-center shrink-0">
                    {entry.rank <= 3
                      ? <Medal className={cn("w-6 h-6 mx-auto", medalColors[entry.rank - 1])} />
                      : <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary">{entry.totalScore}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz ? `/ ${quiz.questions.length}` : "pts"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
