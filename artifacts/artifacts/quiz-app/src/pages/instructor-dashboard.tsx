import { useState } from "react";
import { Link } from "wouter";
import {
  useListQuizzes, getListQuizzesQueryKey,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useGetQuiz, getGetQuizQueryKey,
  useGetQuizStats, getGetQuizStatsQueryKey,
  useAddQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BookOpen, Plus, Trash2, Pencil, ChevronLeft, Users, BarChart2, X, Check, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuizSummary = {
  id: number; title: string; topic: string; description?: string | null;
  questionCount: number; sessionCount: number; createdAt: string;
};

export default function InstructorDashboard() {
  const queryClient = useQueryClient();
  const { data: quizzes, isLoading } = useListQuizzes();
  const createQuiz = useCreateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showEditQuiz, setShowEditQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizTopic, setNewQuizTopic] = useState("");
  const [newQuizDescription, setNewQuizDescription] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const updateQuiz = useUpdateQuiz();

  const { data: selectedQuiz } = useGetQuiz(selectedQuizId ?? 0, {
    query: { enabled: !!selectedQuizId, queryKey: getGetQuizQueryKey(selectedQuizId ?? 0) },
  });
  const { data: quizStats } = useGetQuizStats(selectedQuizId ?? 0, {
    query: { enabled: !!selectedQuizId, queryKey: getGetQuizStatsQueryKey(selectedQuizId ?? 0) },
  });

  const invalidateQuizzes = () =>
    queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
  const invalidateSelected = () => {
    if (selectedQuizId) {
      queryClient.invalidateQueries({ queryKey: getGetQuizQueryKey(selectedQuizId) });
      queryClient.invalidateQueries({ queryKey: getGetQuizStatsQueryKey(selectedQuizId) });
    }
  };

  const handleCreateQuiz = () => {
    if (!newQuizTitle.trim() || !newQuizTopic.trim()) return;
    createQuiz.mutate(
      { data: { title: newQuizTitle.trim(), topic: newQuizTopic.trim(), description: newQuizDescription.trim() || undefined } },
      {
        onSuccess: (quiz) => {
          invalidateQuizzes();
          setShowCreateQuiz(false);
          setNewQuizTitle(""); setNewQuizTopic(""); setNewQuizDescription("");
          setSelectedQuizId(quiz.id);
        },
      }
    );
  };

  const handleDeleteQuiz = (id: number) => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    deleteQuiz.mutate({ id }, {
      onSuccess: () => {
        invalidateQuizzes();
        if (selectedQuizId === id) setSelectedQuizId(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-bold font-serif">Instructor Dashboard</span>
            </div>
          </div>
          <Button onClick={() => setShowCreateQuiz(true)} className="gap-2" data-testid="button-create-quiz">
            <Plus className="w-4 h-4" /> New Quiz
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6 h-full">
          {/* Quiz list sidebar */}
          <div className="w-80 shrink-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your Quizzes</p>
            {isLoading ? (
              [1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
            ) : !quizzes || quizzes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No quizzes yet.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowCreateQuiz(true)}>
                  Create your first quiz
                </Button>
              </div>
            ) : (
              (quizzes as QuizSummary[]).map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  data-testid={`quiz-item-${quiz.id}`}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all group",
                    selectedQuizId === quiz.id
                      ? "bg-primary/5 border-primary/40"
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">{quiz.topic}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{quiz.questionCount} questions</span>
                        <span>{quiz.sessionCount} sessions</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                      data-testid={`button-delete-quiz-${quiz.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quiz detail panel */}
          <div className="flex-1 min-w-0">
            {!selectedQuizId ? (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                <div>
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Select a quiz to manage its questions</p>
                </div>
              </div>
            ) : !selectedQuiz ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {selectedQuiz.topic}
                    </span>
                    <h2 className="text-xl font-bold font-serif mt-2">{selectedQuiz.title}</h2>
                    {selectedQuiz.description && (
                      <p className="text-muted-foreground text-sm mt-1">{selectedQuiz.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowEditQuiz(true)}
                      data-testid="button-edit-quiz"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Link href={`/quiz/${selectedQuiz.id}/leaderboard`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Leaderboard
                      </Button>
                    </Link>
                    <Link href={`/quiz/${selectedQuiz.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        Preview Quiz
                      </Button>
                    </Link>
                  </div>
                </div>

                {quizStats && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Sessions", value: quizStats.sessionCount, icon: Users },
                      { label: "Avg Score", value: quizStats.sessionCount > 0 ? `${quizStats.avgScore}/${selectedQuiz.questions.length}` : "—", icon: BarChart2 },
                      { label: "Hint Usage", value: quizStats.sessionCount > 0 ? `${Math.round(quizStats.avgHintUsage * 100)}%` : "—", icon: BookOpen },
                    ].map(({ label, value, icon: Icon }) => (
                      <Card key={label} className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{label}</span>
                        </div>
                        <p className="text-lg font-bold">{value}</p>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Questions <span className="text-muted-foreground font-normal text-sm">({selectedQuiz.questions.length})</span>
                  </h3>
                  <Button size="sm" className="gap-1.5" onClick={() => setShowAddQuestion(true)} data-testid="button-add-question">
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </Button>
                </div>

                {selectedQuiz.questions.length === 0 ? (
                  <Card className="text-center py-10">
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-3">No questions yet. Add your first question.</p>
                      <Button size="sm" onClick={() => setShowAddQuestion(true)}>Add Question</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {selectedQuiz.questions.map((q, i) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={i}
                        onDelete={() => invalidateSelected()}
                        onUpdate={() => invalidateSelected()}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Quiz Dialog */}
      <Dialog open={showCreateQuiz} onOpenChange={setShowCreateQuiz}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                data-testid="input-quiz-title"
                placeholder="e.g. Introduction to Algorithms"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Input
                data-testid="input-quiz-topic"
                placeholder="e.g. Computer Science"
                value={newQuizTopic}
                onChange={(e) => setNewQuizTopic(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea
                data-testid="input-quiz-description"
                placeholder="Brief description of the quiz..."
                value={newQuizDescription}
                onChange={(e) => setNewQuizDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateQuiz(false)}>Cancel</Button>
            <Button
              onClick={handleCreateQuiz}
              disabled={!newQuizTitle.trim() || !newQuizTopic.trim() || createQuiz.isPending}
              data-testid="button-confirm-create-quiz"
            >
              {createQuiz.isPending ? "Creating..." : "Create Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Dialog */}
      {selectedQuiz && (
        <Dialog open={showEditQuiz} onOpenChange={setShowEditQuiz}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Quiz</DialogTitle>
            </DialogHeader>
            <EditQuizForm
              quiz={selectedQuiz}
              onClose={() => setShowEditQuiz(false)}
              onSuccess={() => {
                invalidateQuizzes();
                invalidateSelected();
                setShowEditQuiz(false);
              }}
              updateQuiz={updateQuiz}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Question Dialog */}
      {selectedQuizId && (
        <AddQuestionDialog
          quizId={selectedQuizId}
          open={showAddQuestion}
          onOpenChange={setShowAddQuestion}
          onSuccess={() => { invalidateSelected(); invalidateQuizzes(); }}
        />
      )}
    </div>
  );
}

function QuestionCard({
  question, index, onDelete, onUpdate,
}: {
  question: { id: number; text: string; choices: string[]; correctAnswer: string; hint: string; orderIndex: number };
  index: number;
  onDelete: () => void;
  onUpdate: () => void;
}) {
  const deleteQuestion = useDeleteQuestion();
  const [editing, setEditing] = useState(false);

  const handleDelete = () => {
    if (!confirm("Delete this question?")) return;
    deleteQuestion.mutate({ id: question.id }, { onSuccess: onDelete });
  };

  if (editing) {
    return (
      <EditQuestionCard
        question={question}
        onCancel={() => setEditing(false)}
        onSuccess={() => { setEditing(false); onUpdate(); }}
      />
    );
  }

  return (
    <Card className="group">
      <CardContent className="py-4">
        <div className="flex gap-3 items-start">
          <div className="shrink-0 mt-0.5">
            <span className="text-xs font-bold text-muted-foreground">Q{index + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug">{question.text}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {question.choices.map((choice) => (
                <span
                  key={choice}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border",
                    choice === question.correctAnswer
                      ? "bg-green-50 border-green-300 text-green-700 font-semibold"
                      : "bg-muted/40 border-border text-muted-foreground"
                  )}
                >
                  {choice}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <span className="font-medium">Hint:</span> {question.hint}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={() => setEditing(true)}
              data-testid={`button-edit-question-${question.id}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              data-testid={`button-delete-question-${question.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditQuestionCard({
  question, onCancel, onSuccess,
}: {
  question: { id: number; text: string; choices: string[]; correctAnswer: string; hint: string };
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const updateQuestion = useUpdateQuestion();
  const [text, setText] = useState(question.text);
  const [choices, setChoices] = useState<string[]>(question.choices);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [hint, setHint] = useState(question.hint);

  const handleSave = () => {
    if (!text.trim() || choices.some((c) => !c.trim()) || !correctAnswer || !hint.trim()) return;
    updateQuestion.mutate(
      { id: question.id, data: { text: text.trim(), choices, correctAnswer, hint: hint.trim() } },
      { onSuccess }
    );
  };

  return (
    <Card className="border-primary/30">
      <CardContent className="py-4 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Question</Label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Answer choices (select correct)</Label>
          {choices.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setCorrectAnswer(c)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                  correctAnswer === c ? "border-green-500 bg-green-500" : "border-muted-foreground/30 hover:border-green-400"
                )}
              >
                {correctAnswer === c && <Check className="w-3 h-3 text-white" />}
              </button>
              <Input
                value={c}
                onChange={(e) => {
                  const next = [...choices]; next[i] = e.target.value;
                  setChoices(next);
                  if (correctAnswer === c) setCorrectAnswer(e.target.value);
                }}
                className="text-sm h-8"
              />
              {choices.length > 2 && (
                <Button
                  variant="ghost" size="icon" className="w-7 h-7 shrink-0"
                  onClick={() => {
                    const next = choices.filter((_, j) => j !== i);
                    if (correctAnswer === c) setCorrectAnswer(next[0] ?? "");
                    setChoices(next);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="ghost" size="sm" className="gap-1 text-xs mt-1"
            onClick={() => setChoices([...choices, ""])}
          >
            <Plus className="w-3 h-3" /> Add choice
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hint</Label>
          <Input value={hint} onChange={(e) => setHint(e.target.value)} className="text-sm h-8" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={updateQuestion.isPending}>
            {updateQuestion.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddQuestionDialog({
  quizId, open, onOpenChange, onSuccess,
}: {
  quizId: number; open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void;
}) {
  const addQuestion = useAddQuestion();
  const [text, setText] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [hint, setHint] = useState("");

  const reset = () => { setText(""); setChoices(["", "", "", ""]); setCorrectAnswer(""); setHint(""); };

  const handleAdd = () => {
    const trimmedChoices = choices.filter((c) => c.trim());
    if (!text.trim() || trimmedChoices.length < 2 || !correctAnswer || !hint.trim()) return;
    addQuestion.mutate(
      { id: quizId, data: { text: text.trim(), choices: trimmedChoices, correctAnswer, hint: hint.trim() } },
      {
        onSuccess: () => {
          onSuccess();
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Question text</Label>
            <Textarea
              data-testid="input-question-text"
              placeholder="Enter the question..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Answer choices <span className="text-muted-foreground font-normal text-xs">(click circle to mark correct)</span></Label>
            {choices.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => c.trim() && setCorrectAnswer(c.trim())}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                    correctAnswer && correctAnswer === c.trim()
                      ? "border-green-500 bg-green-500"
                      : "border-muted-foreground/30 hover:border-green-400"
                  )}
                  data-testid={`choice-correct-${i}`}
                >
                  {correctAnswer && correctAnswer === c.trim() && <Check className="w-3 h-3 text-white" />}
                </button>
                <Input
                  data-testid={`input-choice-${i}`}
                  placeholder={`Choice ${i + 1}`}
                  value={c}
                  onChange={(e) => {
                    const next = [...choices];
                    const old = next[i];
                    next[i] = e.target.value;
                    setChoices(next);
                    if (correctAnswer === old.trim()) setCorrectAnswer(e.target.value.trim());
                  }}
                />
                {choices.length > 2 && (
                  <Button
                    variant="ghost" size="icon" className="w-8 h-8 shrink-0"
                    onClick={() => {
                      const next = choices.filter((_, j) => j !== i);
                      setChoices(next);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost" size="sm" className="gap-1 text-xs"
              onClick={() => setChoices([...choices, ""])}
            >
              <Plus className="w-3.5 h-3.5" /> Add choice
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>Hint</Label>
            <Input
              data-testid="input-question-hint"
              placeholder="A hint for students who are stuck..."
              value={hint}
              onChange={(e) => setHint(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!text.trim() || choices.filter((c) => c.trim()).length < 2 || !correctAnswer || !hint.trim() || addQuestion.isPending}
            data-testid="button-confirm-add-question"
          >
            {addQuestion.isPending ? "Adding..." : "Add Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditQuizForm({
  quiz, onClose, onSuccess, updateQuiz,
}: {
  quiz: { id: number; title: string; topic: string; description?: string | null };
  onClose: () => void;
  onSuccess: () => void;
  updateQuiz: ReturnType<typeof useUpdateQuiz>;
}) {
  const [title, setTitle] = useState(quiz.title);
  const [topic, setTopic] = useState(quiz.topic);
  const [description, setDescription] = useState(quiz.description ?? "");

  const handleSave = () => {
    if (!title.trim() || !topic.trim()) return;
    updateQuiz.mutate(
      { id: quiz.id, data: { title: title.trim(), topic: topic.trim(), description: description.trim() || undefined } },
      { onSuccess }
    );
  };

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            data-testid="input-edit-quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <Input
            data-testid="input-edit-quiz-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Description (optional)</Label>
          <Textarea
            data-testid="input-edit-quiz-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={!title.trim() || !topic.trim() || updateQuiz.isPending}
          data-testid="button-confirm-edit-quiz"
        >
          {updateQuiz.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
