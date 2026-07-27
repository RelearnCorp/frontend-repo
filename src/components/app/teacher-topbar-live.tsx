"use client";

import { useCallback } from "react";
import { AppTopbar } from "@/components/app/app-topbar";
import { classesApi } from "@/services/api";
import { useLiveData } from "@/hooks/use-live-data";

export function TeacherTopbarLive() {
  const fetcher = useCallback(async () => {
    const data = await classesApi.list();
    const firstClass = data.classes[0];
    return firstClass?.name ?? "Dashboard Overview";
  }, []);

  const { data: subtitle, status } = useLiveData(fetcher, "No classes yet");

  return (
    <AppTopbar
      title="Teacher Overview"
      subtitle={
        status === "loading"
          ? "Loading classes..."
          : status === "error"
            ? "Couldn't load classes — showing defaults"
            : subtitle
      }
    />
  );
}
