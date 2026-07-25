"use client";

import { Zap } from "lucide-react";
import { InitialsAvatar } from "@/components/app/initials-avatar";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/hooks/use-auth";

export function ProfileHeaderLive() {
  const { user } = useAuth();
  const name = user?.full_name ?? "Student";

  return (
    <div className="flex items-center gap-5">
      <span className="relative">
        <InitialsAvatar
          name={name}
          tone="rose"
          className="size-16 text-lg"
        />
        <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-card bg-emerald-500 text-white">
          <Zap className="size-2.5" />
        </span>
      </span>
      <div>
        <H2>{name}</H2>
        <Muted>
          Active Learner • {user?.role?.name === "student" ? "Enrolled Student" : (user?.role?.name ?? "Guest")}
        </Muted>
        <p className="flex items-center gap-5 pt-2 text-sm">
          <span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              94th
            </span>{" "}
            <span className="text-muted-foreground">Percentile</span>
          </span>
          <span>
            <span className="font-bold">12</span>{" "}
            <span className="text-muted-foreground">Certificates</span>
          </span>
        </p>
      </div>
    </div>
  );
}
