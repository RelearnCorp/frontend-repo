"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useDisclosure } from "@/hooks/use-disclosure";
import { NAV_ITEMS, SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isOpen, toggle, close } = useDisclosure();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight"
          onClick={close}
        >
          {SITE_CONFIG.name}
        </Link>

        <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="#login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Log in
          </Link>
          <Link href="#signup" className={cn(buttonVariants())}>
            Get started
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={toggle}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      </nav>

      {isOpen && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="#login"
              onClick={close}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Log in
            </Link>
            <Link
              href="#signup"
              onClick={close}
              className={cn(buttonVariants())}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
