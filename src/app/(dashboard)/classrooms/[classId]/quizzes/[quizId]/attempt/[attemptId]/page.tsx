/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, LoaderCircle } from "lucide-react";
import { quizzesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { ApiQuestion, QuizAnswer, AttemptStartData } from "@/types/api";

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const quizId = params.quizId as string;
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptStartData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: We would fetch attempt details when the backend endpoint is available
      // For now using placeholder
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load quiz");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const quizAnswers: QuizAnswer[] = attempt?.questions.map((q) => ({
        question_id: q.id || "",
        student_answer: answers[q.id || ""] || "",
      })) || [];

      const result = await quizzesApi.submitAttempt(attemptId, quizAnswers);
      router.push(`/classrooms/${classId}/quizzes/${quizId}/results/${result.attempt_id}`);
    } catch (err) {
      alert("Failed to submit quiz");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
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
              <p className="text-sm text-destructive">{error || "Quiz not found"}</p>
            </div>
          </div>
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
            <DashboardCard>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{currentQuestion.question_text || currentQuestion.content}</h2>
                </div>

                <div className="space-y-3">
                  {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
                    <>
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-3 p-3 rounded border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={key}
                            checked={answers[currentQuestion.id || ""] === key}
                            onChange={() => handleAnswerChange(currentQuestion.id || "", key)}
                            className="cursor-pointer"
                          />
                          <span className="font-medium">{value}</span>
                        </label>
                      ))}
                    </>
                  )}

                  {(currentQuestion.question_type === "short_answer" || currentQuestion.question_type === "essay") && (
                    <textarea
                      value={answers[currentQuestion.id || ""] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id || "", e.target.value)}
                      placeholder={currentQuestion.question_type === "essay" ? "Write your essay here..." : "Enter your answer..."}
                      className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-32"
                    />
                  )}
                </div>

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
