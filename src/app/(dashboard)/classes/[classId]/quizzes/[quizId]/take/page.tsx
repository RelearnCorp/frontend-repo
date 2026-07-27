"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Check, Lightbulb, LoaderCircle, Trophy } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { AuthGuard } from "@/components/app/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getSidebarSections } from "@/constants/nav";
import { aiApi, quizzesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import type {
  AttemptStartData,
  AttemptSubmitData,
  HintLevel,
  LearningMode,
} from "@/types/api";

const LEARNING_MODE_LABEL: Record<LearningMode, string> = {
  normal: "Normal",
  socratic: "Socratic (guided questions)",
  explainable: "Explainable (step-by-step)",
};

function StartScreen({
  onStart,
}: {
  onStart: (mode: LearningMode) => Promise<void>;
}) {
  const [mode, setMode] = useState<LearningMode>("normal");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  return (
    <DashboardCard title="Start this quiz" titleRender={<h2 />} className="mx-auto max-w-md">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="learning-mode">
            Learning mode
          </label>
          <Select value={mode} onValueChange={(v) => setMode(v as LearningMode)}>
            <SelectTrigger id="learning-mode" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LEARNING_MODE_LABEL) as LearningMode[]).map((m) => (
                <SelectItem key={m} value={m}>
                  {LEARNING_MODE_LABEL[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          className="w-full font-semibold"
          disabled={isStarting}
          onClick={async () => {
            setError(null);
            setIsStarting(true);
            try {
              await onStart(mode);
            } catch (err) {
              setError(
                err instanceof ApiError ? err.message : "Couldn't start the quiz.",
              );
              setIsStarting(false);
            }
          }}
        >
          {isStarting && <LoaderCircle className="animate-spin" />}
          Start Quiz
        </Button>
      </div>
    </DashboardCard>
  );
}

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
    <div className="space-y-2 pt-3">
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

function QuestionCard({
  index,
  question,
  answer,
  onAnswerChange,
}: {
  index: number;
  question: AttemptStartData["questions"][number];
  answer: string;
  onAnswerChange: (value: string) => void;
}) {
  const type = question.question_type ?? question.type ?? "short_answer";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold" render={<h3 />}>
          {index + 1}. {question.question_text ?? question.content}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === "multiple_choice" && question.options ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(question.options).map(([key, value]) => (
              <button
                key={key}
                type="button"
                aria-pressed={answer === key}
                onClick={() => onAnswerChange(key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  answer === key
                    ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/60"
                    : "hover:bg-muted/60",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold uppercase">
                  {key}
                </span>
                {value}
              </button>
            ))}
          </div>
        ) : (
          <Textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer…"
          />
        )}
        <HintPanel questionId={question.id} />
      </CardContent>
    </Card>
  );
}

function ResultScreen({
  result,
  classId,
}: {
  result: AttemptSubmitData;
  classId: string;
}) {
  return (
    <DashboardCard title="Results" titleRender={<h2 />} className="mx-auto max-w-md text-center">
      <Trophy className="mx-auto size-10 text-amber-500" />
      <p className="pt-3 text-4xl font-bold tracking-tight">
        {result.percentage_score}%
      </p>
      <Muted className="pt-1 text-sm">
        {result.score} / {result.total_questions} correct
      </Muted>
      <Badge className="mt-3">{result.status}</Badge>
      <Button
        className="mt-6 w-full font-semibold"
        nativeButton={false}
        render={<Link href={`/classes/${classId}`} />}
      >
        Back to Class
      </Button>
    </DashboardCard>
  );
}

export default function TakeQuizPage({
  params,
}: {
  params: Promise<{ classId: string; quizId: string }>;
}) {
  const { classId, quizId } = use(params);
  const [attempt, setAttempt] = useState<AttemptStartData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptSubmitData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async (mode: LearningMode) => {
    const data = await quizzesApi.startAttempt(quizId, mode);
    setAttempt(data);
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const data = await quizzesApi.submitAttempt(
        attempt.attempt_id,
        attempt.questions.map((q) => ({
          question_id: q.id,
          student_answer: answers[q.id] ?? "",
        })),
      );
      setResult(data);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Couldn't submit the quiz.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered =
    !!attempt && attempt.questions.every((q) => (answers[q.id] ?? "").trim());

  return (
    <AuthGuard role="student">
      <AppSidebar sections={getSidebarSections("student")} />
      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar
          title="Take Quiz"
          subtitle={
            <Link href={`/classes/${classId}`} className="hover:underline">
              Back to class
            </Link>
          }
        />

        <main className="mx-auto w-full max-w-2xl space-y-5 p-6 lg:p-8">
          {result ? (
            <ResultScreen result={result} classId={classId} />
          ) : !attempt ? (
            <StartScreen onStart={handleStart} />
          ) : (
            <>
              {attempt.questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                  answer={answers[question.id] ?? ""}
                  onAnswerChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: value }))
                  }
                />
              ))}
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              <Button
                className="w-full gap-1.5 font-semibold"
                disabled={!allAnswered || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Check />
                )}
                Submit Quiz
              </Button>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
