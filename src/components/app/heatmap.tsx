import { cn } from "@/lib/utils";

/** Severity tiers for concept/misconception heatmap tiles. */
export type HeatTier = "clear" | "info" | "warm" | "hot" | "critical";

const TIER_STYLES: Record<
  HeatTier,
  { card: string; topic: string; value: string }
> = {
  clear: {
    card: "border-teal-100 bg-teal-50/60 dark:border-teal-900 dark:bg-teal-950/40",
    topic: "text-foreground",
    value: "text-muted-foreground",
  },
  info: {
    card: "border-border bg-muted/50",
    topic: "text-foreground",
    value: "text-muted-foreground",
  },
  warm: {
    card: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    topic: "text-amber-900 dark:text-amber-200",
    value: "text-amber-600 dark:text-amber-400",
  },
  hot: {
    card: "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40",
    topic: "text-rose-800 dark:text-rose-200",
    value: "text-rose-600 dark:text-rose-400",
  },
  critical: {
    card: "border-rose-400 bg-rose-400 dark:border-rose-600 dark:bg-rose-600",
    topic: "text-white",
    value: "text-rose-50",
  },
};

export function HeatmapTile({
  topic,
  detail,
  tier,
}: {
  topic: string;
  detail: string;
  tier: HeatTier;
}) {
  const styles = TIER_STYLES[tier];
  return (
    <div
      className={cn(
        "flex min-h-28 flex-col justify-between rounded-xl border p-4",
        styles.card,
      )}
    >
      <p className={cn("text-sm font-bold", styles.topic)}>{topic}</p>
      <p className={cn("text-xs font-medium", styles.value)}>{detail}</p>
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
      Clear
      <span
        aria-hidden
        className="h-2 w-24 rounded-full bg-gradient-to-r from-teal-300 via-amber-300 to-rose-500"
      />
      Critical
    </div>
  );
}
