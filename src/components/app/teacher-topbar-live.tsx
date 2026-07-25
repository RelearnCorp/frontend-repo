"use client";

import { useCallback } from "react";
import { AppTopbar } from "@/components/app/app-topbar";
import { NotificationButton } from "@/components/app/notification-button";
import { Button } from "@/components/ui/button";
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
      title="Teacher Intelligence Dashboard"
      subtitle={
        status === "loading"
          ? "Loading classes..."
          : status === "error"
            ? "Couldn't load classes — showing defaults"
            : subtitle
      }
    >
      <NotificationButton />
      <Button className="font-semibold" disabled title="Coming soon">
        Generate Weekly Report
      </Button>
    </AppTopbar>
  );
}
