import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const TONES = {
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  slate: "bg-muted text-muted-foreground",
} as const;

export type AvatarTone = keyof typeof TONES;

export function InitialsAvatar({
  name,
  tone = "indigo",
  className,
}: {
  name: string;
  tone?: AvatarTone;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar aria-hidden className={cn("size-9", className)}>
      <AvatarFallback
        className={cn("text-xs font-semibold", TONES[tone])}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
