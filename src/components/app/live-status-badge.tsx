import { Badge } from "@/components/ui/badge";
import type { LiveDataStatus } from "@/hooks/use-live-data";

/**
 * Makes fetch failures visible instead of silently showing fallback data
 * as if it were real (Nielsen heuristic #1: visibility of system status).
 */
export function LiveStatusBadge({ status }: { status: LiveDataStatus }) {
  if (status === "live") {
    return (
      <Badge className="bg-emerald-50 text-[10px] font-bold tracking-wide text-emerald-700 uppercase dark:bg-emerald-950 dark:text-emerald-300">
        Live
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge
        variant="secondary"
        className="bg-amber-50 text-[10px] font-bold tracking-wide text-amber-700 uppercase dark:bg-amber-950 dark:text-amber-300"
        title="Couldn't reach the backend — showing example data"
      >
        Preview data
      </Badge>
    );
  }

  return null;
}
