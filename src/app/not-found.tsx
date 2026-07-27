import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { H1, Muted } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <Compass className="size-10 text-muted-foreground/50" />
      <H1 render={<h1 />}>Page not found</H1>
      <Muted className="max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </Muted>
      <Button className="mt-2 font-semibold" nativeButton={false} render={<Link href="/" />}>
        Back to home
      </Button>
    </div>
  );
}
