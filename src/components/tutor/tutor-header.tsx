"use client";

import Link from "next/link";

import { InitialsAvatar } from "@/components/app/initials-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function TutorHeader() {
  const { user } = useAuth();
  const name = user?.full_name ?? "Guest";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <h1 className="sr-only">AI Tutor</h1>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          className="shrink-0"
          render={<Link href="/classrooms" aria-label="Back to Classes" />}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m15 18-6-6 6-6"/></svg>
        </Button>
        <span className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            R
          </span>
          <span className="hidden text-sm font-bold tracking-tight sm:block">
            Relearn AI Tutor
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-semibold sm:block">{name}</span>
        <InitialsAvatar name={name} tone="teal" />
      </div>
    </header>
  );
}
