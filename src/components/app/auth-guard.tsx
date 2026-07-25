"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { tokenStore } from "@/services/http";

/**
 * Tokens live in localStorage (no session cookie), so there is nothing for
 * Next.js middleware to read on the edge — the check has to happen client-side
 * before rendering the protected shell.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!tokenStore.getAccessToken()) {
      router.replace("/login");
      return;
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
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
