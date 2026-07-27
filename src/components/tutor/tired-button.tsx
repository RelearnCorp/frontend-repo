"use client";

import { ToggleLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TiredButton({
  active,
  onClick,
}: {
  /** Whether the tutor is currently asked to give direct, step-by-step answers. */
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-auto gap-3 rounded-full px-5 py-2.5 text-left shadow-xs",
        active &&
          "border-indigo-300 bg-indigo-50 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/60 dark:hover:bg-indigo-950/60",
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ToggleLeft className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-bold">
          {active ? "Back to concise answers" : "I'm Tired / I Give Up"}
        </span>
        <span className="block text-xs font-normal text-muted-foreground">
          {active
            ? "Step-by-step explanations active"
            : "Switch to a direct, step-by-step explanation"}
        </span>
      </span>
    </Button>
  );
}
