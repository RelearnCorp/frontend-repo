"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, AlertCircle } from "lucide-react";
import { quizzesApi, classesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { ApiQuiz, ApiQuestion } from "@/types/api";

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params.classId as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<ApiQuiz | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: We would fetch quiz and questions when the backend endpoint is available
      // For now using placeholder data
      setQuestions([]);
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

  const isTeacher = user?.role?.name === "teacher";

  const handleStartQuiz = async () => {
    try {
      const attempt = await quizzesApi.startAttempt(quizId);
      router.push(`/classrooms/${classId}/quizzes/${quizId}/attempt/${attempt.attempt_id}`);
    } catch (err) {
      alert("Failed to start quiz");
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

  if (error || !quiz) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="border-b border-border px-6 py-4 lg:px-8">
          <Link href={`/classrooms/${classId}/quizzes`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to Quizzes
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

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href={`/classrooms/${classId}/quizzes`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Quizzes
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Quiz Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">{quiz?.title}</h1>
            {quiz?.description && (
              <p className="text-lg text-muted-foreground">{quiz.description}</p>
            )}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${quiz?.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {quiz?.is_published ? "Published" : "Draft"}
              </span>
              <span className="text-sm text-muted-foreground">
                {questions.length} questions
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isTeacher && (
              <Button
                onClick={handleStartQuiz}
                className="gap-2"
                size="lg"
              >
                <Play className="size-5" />
                Start Quiz
              </Button>
            )}
            {isTeacher && (
              <>
                <Link href={`/classrooms/${classId}/quizzes/${quizId}/edit`}>
                  <Button variant="outline">Edit Quiz</Button>
                </Link>
                <Link href={`/classrooms/${classId}/quizzes/${quizId}/results`}>
                  <Button variant="outline">View Results</Button>
                </Link>
              </>
            )}
          </div>

          {/* Questions Preview */}
          {questions.length > 0 && (
            <DashboardCard>
              <h3 className="font-semibold mb-4">Questions Preview</h3>
              <div className="space-y-4">
                {questions.map((question, idx) => (
                  <div key={question.id} className="p-3 rounded bg-muted/50">
                    <p className="font-medium">Q{idx + 1}: {question.question_text || question.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {question.question_type || question.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
                    </p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}
        </div>
      </main>
    </div>
  );
}
