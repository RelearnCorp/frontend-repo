"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params.classId as string;
  const [quizId, setQuizId] = useState("");

  const isTeacher = user?.role?.name === "teacher";

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href={`/classrooms/${classId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Class
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isTeacher ? "Create and manage quizzes for your class" : "Take quizzes and track your progress"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
            <HelpCircle className="size-12 text-muted-foreground/50" />

            {isTeacher ? (
              <>
                <div>
                  <h2 className="text-lg font-semibold">Create a quiz for this class</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    There&apos;s no quiz history list yet — after creating a
                    quiz you&apos;ll get a link you can share directly with
                    students.
                  </p>
                </div>
                <Link href={`/classrooms/${classId}/quizzes/create`}>
                  <Button className="gap-2">
                    <Plus className="size-4" />
                    Create Quiz
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-semibold">Have a quiz link?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your teacher shares a direct link (or quiz ID) for each
                    quiz — paste the ID below to start it.
                  </p>
                </div>
                <form
                  className="flex w-full max-w-xs gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!quizId.trim()) return;
                    router.push(`/classrooms/${classId}/quizzes/${quizId.trim()}`);
                  }}
                >
                  <Input
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    placeholder="Quiz ID"
                    className="font-mono"
                  />
                  <Button type="submit" disabled={!quizId.trim()}>
                    Go
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
