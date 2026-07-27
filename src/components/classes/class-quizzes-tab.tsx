"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Muted } from "@/components/ui/typography";

export function ClassQuizzesTab({
  classId,
  role,
}: {
  classId: string;
  role: "teacher" | "student";
}) {
  const router = useRouter();
  const [quizId, setQuizId] = useState("");

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <ClipboardList className="size-8 text-muted-foreground/50" />

      {role === "teacher" ? (
        <>
          <div>
            <p className="text-sm font-semibold">Create a quiz for this class</p>
            <Muted className="mx-auto max-w-sm text-xs">
              After you create a quiz and add questions, you&apos;ll get a
              shareable link to send students directly to it.
            </Muted>
          </div>
          <Button
            className="gap-1.5 font-semibold"
            nativeButton={false}
            render={<Link href={`/classes/${classId}/quizzes/new`} />}
          >
            <Plus />
            Create Quiz
          </Button>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm font-semibold">Have a quiz link?</p>
            <Muted className="mx-auto max-w-sm text-xs">
              Your teacher shares a direct link (or quiz ID) for each quiz —
              paste the ID below to start it.
            </Muted>
          </div>
          <form
            className="flex w-full max-w-xs gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!quizId.trim()) return;
              router.push(`/classes/${classId}/quizzes/${quizId.trim()}/take`);
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
  );
}
