import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Alert({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/50 bg-destructive/10 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 shrink-0 mt-0.5 text-destructive" />
        <p className="text-sm text-destructive">{children}</p>
      </div>
    </div>
  );
}

export { Alert };
