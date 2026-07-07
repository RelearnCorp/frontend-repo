import { cn } from "@/lib/utils";

export function MainWrapper({
  children,
  className,
}: React.ComponentProps<"main">) {
  return (
    <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </main>
  );
}
