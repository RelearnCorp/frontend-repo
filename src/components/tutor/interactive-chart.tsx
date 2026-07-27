"use client";

import { useCallback } from "react";
import { LoaderCircle } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Muted } from "@/components/ui/typography";
import { useApiData } from "@/hooks/use-api-data";
import { analyticsApi } from "@/services/api";

/** Real recent-quiz-score trend for the selected class (no sample/fake data). */
export function InteractiveChart({ classId }: { classId: string | null }) {
  const fetcher = useCallback(
    () => analyticsApi.progress(classId ?? undefined),
    [classId],
  );
  const { data, status } = useApiData(fetcher);

  if (!classId) return null;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading scores…
      </div>
    );
  }

  const points = (data?.quizzes ?? [])
    .filter((attempt) => attempt.percentage_score != null)
    .slice()
    .reverse()
    .map((attempt, index) => ({
      label: `#${index + 1}`,
      score: attempt.percentage_score as number,
    }));

  if (points.length === 0) {
    return (
      <Muted className="py-4 text-center text-xs">
        No quiz scores in this class yet.
      </Muted>
    );
  }

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#71717a33" />
          <XAxis dataKey="label" stroke="#71717a" fontSize={10} />
          <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
          <Tooltip
            formatter={(value) => [`${value}%`, "Score"]}
            contentStyle={{ borderRadius: 8, fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Score %"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ fill: "#6366f1", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
