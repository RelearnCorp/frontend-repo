"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { loadQuizResult } from "@/lib/quiz-attempt-storage";
import type { AttemptSubmitData } from "@/types/api";

export default function QuizResultsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const quizId = params.quizId as string;
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<AttemptSubmitData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = loadQuizResult(attemptId);
    // Deferred a tick so this transition happens in a promise callback
    // rather than synchronously in the effect body.
    Promise.resolve().then(() => {
      if (stored) {
        setResult(stored);
      } else {
        setNotFound(true);
      }
    });
  }, [attemptId]);

  if (notFound) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="border-b border-border px-6 py-4 lg:px-8">
          <Link href={`/classrooms/${classId}/quizzes`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to Quizzes
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="max-w-md space-y-4 text-center">
            <AlertCircle className="mx-auto size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              This result isn&apos;t available directly (it only exists right
              after you submit a quiz). Check your quiz history and overall
              progress on the Analytics page instead.
            </p>
            <Link href="/analytics">
              <Button variant="outline">Go to Analytics</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading results…</div>
        </div>
      </div>
    );
  }

  const isPassed = result.percentage_score >= 70;

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href={`/classrooms/${classId}/quizzes`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Quizzes
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center overflow-y-auto p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center">
            {isPassed ? (
              <CheckCircle2 className="size-20 text-green-500" />
            ) : (
              <AlertCircle className="size-20 text-orange-500" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{result.percentage_score}%</h1>
            <p className="text-lg text-muted-foreground">
              {isPassed ? "Great job!" : "Nice effort!"}
            </p>
          </div>

          <DashboardCard title="Results" className="text-left">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Correct Answers</span>
                <span className="font-bold text-lg">
                  {result.score} / {result.total_questions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Score</span>
                <span className="font-bold text-lg">{result.percentage_score}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed</span>
                <span className="text-sm">
                  {new Date(result.completed_at).toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className={`text-sm font-semibold ${isPassed ? "text-green-600" : "text-orange-600"}`}>
                  {isPassed ? "✓ Passed" : "• Try Again"}
                </div>
              </div>
            </div>
          </DashboardCard>

          <div className="flex flex-col gap-3">
            <Link href={`/classrooms/${classId}/quizzes/${quizId}`} className="w-full">
              <Button className="w-full">Back to Quiz</Button>
            </Link>
            <Link href="/analytics" className="w-full">
              <Button variant="outline" className="w-full">View All Results</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
