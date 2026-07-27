"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";

export default function QuizResultsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const quizId = params.quizId as string;

  // Placeholder result data - would be fetched from backend
  const result = {
    score: 85,
    totalQuestions: 10,
    percentage: 85,
    completed_at: new Date().toLocaleDateString(),
  };

  const isPassed = result.percentage >= 70;

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
          {/* Result Header */}
          <div className="flex justify-center">
            {isPassed ? (
              <CheckCircle2 className="size-20 text-green-500" />
            ) : (
              <AlertCircle className="size-20 text-orange-500" />
            )}
          </div>

          {/* Score Display */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{result.percentage}%</h1>
            <p className="text-lg text-muted-foreground">
              {isPassed ? "Great job!" : "Nice effort!"}
            </p>
          </div>

          {/* Results Card */}
          <DashboardCard className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Correct Answers</span>
              <span className="font-bold text-lg">{result.score} / {result.totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Score</span>
              <span className="font-bold text-lg">{result.percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Completed</span>
              <span className="text-sm">{result.completed_at}</span>
            </div>
            <div className="pt-3 border-t">
              <div className={`text-sm font-semibold ${isPassed ? "text-green-600" : "text-orange-600"}`}>
                {isPassed ? "✓ Passed" : "• Try Again"}
              </div>
            </div>
          </DashboardCard>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link href={`/classrooms/${classId}/quizzes/${quizId}`} className="w-full">
              <Button className="w-full">View Quiz Again</Button>
            </Link>
            <Link href={`/classrooms/${classId}/quizzes`} className="w-full">
              <Button variant="outline" className="w-full">Back to All Quizzes</Button>
            </Link>
          </div>

          {/* Feedback Message */}
          <div className="p-4 rounded-lg bg-muted text-sm">
            <p>
              {isPassed
                ? "Excellent work! You've demonstrated a good understanding of the material."
                : "Review the material and try again to improve your score."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
