import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create a Relearn account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
          R
        </span>
        <span className="text-xl font-bold tracking-tight">Relearn</span>
      </Link>
      <AuthForm />
    </div>
  );
}
