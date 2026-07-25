import { Separator } from "@/components/ui/separator";

export function AppTopbar({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <>
            <Separator orientation="vertical" className="hidden h-5 self-center sm:block" />
            <p className="hidden truncate text-sm text-muted-foreground sm:block">
              {subtitle}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </header>
  );
}
