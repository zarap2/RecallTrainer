import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetQuiz, useCreateSession, getGetQuizQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, ArrowRight, ChevronLeft, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function StudentQuizEntry() {
  const { quizId } = useParams<{ quizId: string }>();
  const [, setLocation] = useLocation();
  const [studentName, setStudentName] = useState("");
  const [nameError, setNameError] = useState("");

  const id = parseInt(quizId ?? "0", 10);
  const { data: quiz, isLoading, error } = useGetQuiz(id, {
    query: { enabled: !!id, queryKey: getGetQuizQueryKey(id) },
  });
  const createSession = useCreateSession();

  const handleStart = () => {
    if (!studentName.trim()) {
      setNameError("Please enter your name");
      return;
    }
    if (!quiz) return;
    createSession.mutate(
      { data: { quizId: quiz.id, studentName: studentName.trim() } },
      { onSuccess: (session) => setLocation(`/session/${session.id}`) }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-full mt-6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center p-8">
          <p className="text-destructive mb-4">Quiz not found.</p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
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

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit mb-3">
              {quiz.topic}
            </span>
            <CardTitle className="text-2xl font-serif">{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription className="text-base mt-1">{quiz.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-6 text-sm text-muted-foreground border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{quiz.questions.length} questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Taken by {quiz.questions.length > 0 ? "others" : "no one"} yet</span>
              </div>
            </div>

            <div className="bg-muted/20 border border-border/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Scoring rules:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">+1</span> Correct answer without using hint first</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">+0.5</span> Correct answer after viewing hint (before guessing)</li>
                <li className="flex items-start gap-2"><span className="text-foreground font-bold mt-0.5">+0</span> Wrong final answer</li>
                <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">No penalty</span> if your initial guess was correct</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-name">Your name</Label>
              <Input
                id="student-name"
                data-testid="input-student-name"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => { setStudentName(e.target.value); setNameError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
              {nameError && <p className="text-destructive text-sm">{nameError}</p>}
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2"
                onClick={handleStart}
                disabled={createSession.isPending}
                data-testid="button-start-quiz"
              >
                {createSession.isPending ? "Starting..." : "Start Quiz"}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Link href={`/quiz/${quiz.id}/leaderboard`}>
                <Button variant="outline" size="icon" title="Leaderboard">
                  <Trophy className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
