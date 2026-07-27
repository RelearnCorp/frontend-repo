"use client";

import { useCallback, useState } from "react";

import { SidebarBuddy } from "@/components/tutor/sidebar-buddy";
import { TutorSession } from "@/components/tutor/tutor-session";
import { useApiData } from "@/hooks/use-api-data";
import { classesApi } from "@/services/api";

export function TutorWorkspace() {
  const fetcher = useCallback(() => classesApi.list(), []);
  const { data, status } = useApiData(fetcher);
  const classes = data?.classes ?? [];

  const [manuallySelectedId, setManuallySelectedId] = useState<string | null>(null);
  // Default to the first class until the student manually picks another.
  const selectedClassId = manuallySelectedId ?? classes[0]?.id ?? null;

  const selectedClass = classes.find((cls) => cls.id === selectedClassId);
  const classContext = selectedClass
    ? `The student is asking about their class "${selectedClass.name}"${
        selectedClass.description ? `: ${selectedClass.description}` : ""
      }.`
    : undefined;

  return (
    <div className="flex min-h-0 flex-1">
      <SidebarBuddy
        classes={classes}
        classesLoading={status === "loading"}
        selectedClassId={selectedClassId}
        onSelectClass={setManuallySelectedId}
      />
      <TutorSession classContext={classContext} />
    </div>
  );
}
