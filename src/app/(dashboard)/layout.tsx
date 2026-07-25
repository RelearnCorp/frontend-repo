import { AuthGuard } from "@/components/app/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh bg-muted/40">{children}</div>
    </AuthGuard>
  );
}
