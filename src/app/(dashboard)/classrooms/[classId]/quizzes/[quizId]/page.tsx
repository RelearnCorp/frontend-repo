"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Copy, LoaderCircle, Play } from "lucide-react";
import { quizzesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Input } from "@/components/ui/input";
import { useApiData } from "@/hooks/use-api-data";
import { saveQuizAttempt } from "@/lib/quiz-attempt-storage";

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params.classId as string;
  const quizId = params.quizId as string;

  const fetcher = useCallback(() => quizzesApi.listQuestions(quizId), [quizId]);
  const { data, status, error, refetch } = useApiData(fetcher);

  const [copied, setCopied] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const isTeacher = user?.role?.name === "teacher";
  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}/classrooms/${classId}/quizzes/${quizId}`
    : "";

  const handleStartQuiz = async () => {
    setStartError(null);
    setIsStarting(true);
    try {
      const attempt = await quizzesApi.startAttempt(quizId);
      saveQuizAttempt(attempt.attempt_id, attempt);
      router.push(`/classrooms/${classId}/quizzes/${quizId}/attempt/${attempt.attempt_id}`);
    } catch (err) {
      setStartError(err instanceof ApiError ? err.message : "Failed to start quiz");
      setIsStarting(false);
    }
  };

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
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
            <p className="text-sm text-muted-foreground">
              There&apos;s no way to look up a quiz&apos;s title yet — only
              its questions.
            </p>
          </div>

          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading questions…
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={refetch}>
                Try again
              </Button>
            </div>
          )}

          {status === "success" && data && (
            <>
              <p className="text-sm text-muted-foreground">
                {data.count} question{data.count === 1 ? "" : "s"}
              </p>

              {isTeacher ? (
                <DashboardCard title="Share with students">
                  <p className="pb-3 text-sm text-muted-foreground">
                    There&apos;s no quiz directory yet, so share this link
                    directly with your students so they can take it.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={shareLink} className="font-mono text-xs" />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      onClick={async () => {
                        await navigator.clipboard.writeText(shareLink);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? <Check className="text-emerald-600" /> : <Copy />}
                      Copy
                    </Button>
                  </div>
                </DashboardCard>
              ) : (
                <div className="space-y-3">
                  {startError && <p className="text-sm text-destructive">{startError}</p>}
                  <Button onClick={handleStartQuiz} disabled={isStarting} className="gap-2" size="lg">
                    {isStarting ? <LoaderCircle className="animate-spin size-5" /> : <Play className="size-5" />}
                    Start Quiz
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
