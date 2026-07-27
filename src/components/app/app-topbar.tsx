import { Separator } from "@/components/ui/separator";
import { Muted, Typography } from "@/components/ui/typography";

export function AppTopbar({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <Typography variant="h4" render={<h1 />} className="truncate font-bold">
          {title}
        </Typography>
        {subtitle && (
          <>
            <Separator orientation="vertical" className="hidden h-5 self-center sm:block" />
            <Muted className="hidden truncate sm:block">{subtitle}</Muted>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </header>
  );
}
