"use client";

import Link from "next/link";
import { BookMarked } from "lucide-react";

import { InitialsAvatar } from "@/components/app/initials-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function TutorHeader() {
  const { user } = useAuth();
  const name = user?.full_name ?? "Guest";
  const roleLabel = user?.role?.name === "teacher" ? "Teacher" : "Student";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <h1 className="sr-only">AI Tutor</h1>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          className="shrink-0"
          render={<Link href="/profile" aria-label="Back to Dashboard" />}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m15 18-6-6 6-6"/></svg>
        </Button>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            R
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-bold tracking-tight">
              Relearn AI Tutor
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active Session: Kinetic Energy
            </span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          className="hidden rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 md:flex dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950"
        >
          <BookMarked />
          Class Material: Module 3
        </Button>
        <div className="flex items-center gap-3">
          <span className="hidden text-right sm:block">
            <span className="block text-sm font-semibold">{name}</span>
            <span className="block text-xs text-muted-foreground">
              Physics 101 - {roleLabel}
            </span>
          </span>
          <InitialsAvatar name={name} tone="teal" />
        </div>
      </div>
    </header>
  );
}
