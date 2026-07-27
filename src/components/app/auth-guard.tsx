"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { tokenStore } from "@/services/http";
import type { RoleName } from "@/types/api";

/**
 * Tokens live in localStorage (no session cookie), so there is nothing for
 * Next.js middleware to read on the edge — the check has to happen client-side
 * before rendering the protected shell.
 */
export function AuthGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  /** Restrict this route to one or more roles (e.g. quiz-taking is student-only). */
  role?: RoleName | RoleName[];
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!tokenStore.getAccessToken()) {
      router.replace("/login");
      return;
    }
    if (role) {
      const allowed = Array.isArray(role) ? role : [role];
      const currentRole = tokenStore.getUser()?.role?.name;
      if (!currentRole || !allowed.includes(currentRole)) {
        router.replace("/classrooms");
        return;
      }
    }
    // Deferred a tick so this transition happens in a promise callback
    // rather than synchronously in the effect body.
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router, role]);

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
