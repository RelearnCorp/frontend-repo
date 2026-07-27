"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Lightbulb, LoaderCircle } from "lucide-react";
import { aiApi, quizzesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import {
  clearQuizAttempt,
  loadQuizAttempt,
  saveQuizResult,
} from "@/lib/quiz-attempt-storage";
import type { AttemptStartData, HintLevel, QuizAnswer } from "@/types/api";

function HintPanel({ questionId }: { questionId: string }) {
  const [level, setLevel] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextLevel = (level + 1) as 1 | 2 | 3;
  const maxedOut = level >= 3;

  const handleHint = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await aiApi.hint({
        question_id: questionId,
        hint_level: String(nextLevel) as HintLevel,
      });
      setHints((prev) => [...prev, data.hint]);
      setLevel(nextLevel);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't get a hint.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2 pt-4 border-t">
      {hints.map((hint, i) => (
        <div
          key={i}
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <span className="font-bold">Hint {i + 1}:</span> {hint}
        </div>
      ))}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={isLoading || maxedOut}
        onClick={handleHint}
      >
        {isLoading ? <LoaderCircle className="animate-spin" /> : <Lightbulb />}
        {maxedOut ? "No more hints" : `Get Hint (${nextLevel}/3)`}
      </Button>
    </div>
  );
}

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const quizId = params.quizId as string;
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptStartData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    const stored = loadQuizAttempt(attemptId);
    // Deferred a tick so this transition happens in a promise callback
    // rather than synchronously in the effect body.
    Promise.resolve().then(() => {
      if (stored) {
        setAttempt(stored);
      } else {
        setNotFound(true);
      }
    });
  }, [attemptId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const quizAnswers: QuizAnswer[] = attempt.questions.map((q) => ({
        question_id: q.id,
        student_answer: answers[q.id] ?? "",
      }));

      const result = await quizzesApi.submitAttempt(attemptId, quizAnswers);
      saveQuizResult(result.attempt_id, result);
      clearQuizAttempt(attemptId);
      router.push(`/classrooms/${classId}/quizzes/${quizId}/result/${result.attempt_id}`);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to submit quiz");
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="border-b border-border px-6 py-4 lg:px-8">
          <Link href={`/classrooms/${classId}/quizzes/${quizId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to Quiz
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 max-w-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                This quiz session isn&apos;t available anymore — it looks
                like the page was reloaded or opened directly. Go back and
                start the quiz again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading quiz…</div>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / attempt.total_questions) * 100;

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/classrooms/${classId}/quizzes/${quizId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to Quiz
          </Link>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIdx + 1} of {attempt.total_questions}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {currentQuestion && (
            <DashboardCard title={currentQuestion.question_text ?? currentQuestion.content}>
              <div className="space-y-6">
                <div className="space-y-3">
                  {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
                    <>
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-3 p-3 rounded border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={key}
                            checked={answers[currentQuestion.id] === key}
                            onChange={() => handleAnswerChange(currentQuestion.id, key)}
                            className="cursor-pointer"
                          />
                          <span className="font-medium">{value}</span>
                        </label>
                      ))}
                    </>
                  )}

                  {(currentQuestion.question_type === "short_answer" || currentQuestion.question_type === "essay") && (
                    <textarea
                      value={answers[currentQuestion.id] ?? ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.question_type === "essay" ? "Write your essay here..." : "Enter your answer..."}
                      className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-32"
                    />
                  )}
                </div>

                <HintPanel questionId={currentQuestion.id} />

                {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIdx === 0}
                  >
                    Previous
                  </Button>

                  {currentQuestionIdx < attempt.total_questions - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                      className="flex-1"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="flex-1 gap-2"
                    >
                      {submitting && <LoaderCircle className="animate-spin size-4" />}
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </div>
            </DashboardCard>
          )}
        </div>
      </main>
    </div>
  );
}
