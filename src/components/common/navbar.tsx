"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { SITE_CONFIG } from "@/constants/site";

export function Navbar() {
  const { isOpen, toggle, close } = useDisclosure();
  const { user } = useAuth();
  const dashboardHref = "/classrooms";

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

        <div className="hidden items-center gap-4 md:flex">
          <Button
            className="rounded-full shadow-sm hover:shadow-md transition-all gap-1.5 px-5"
            nativeButton={false}
            render={<Link href={user ? dashboardHref : "/login"} />}
          >
            {user ? "Dashboard" : "Get Started"} <ArrowRight className="size-4" />
          </Button>
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
          <Button
            className="rounded-full gap-1.5 w-full"
            nativeButton={false}
            render={<Link href={user ? dashboardHref : "/login"} onClick={close} />}
          >
            {user ? "Dashboard" : "Get Started"} <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </header>
  );
}
