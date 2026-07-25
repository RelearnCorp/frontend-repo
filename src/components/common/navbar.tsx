"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

const MARKETING_NAV = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#product" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const { isOpen, toggle, close } = useDisclosure();
  const { user } = useAuth();
  const [activeHash, setActiveHash] = useState("");
  const dashboardHref = user?.role?.name === "teacher" ? "/teacher" : "/profile";

  useEffect(() => {
    const handleScroll = () => {
      const hashes = MARKETING_NAV.map(item => item.href).filter(href => href.startsWith("#") && href.length > 1);
      
      let current = "#";
      for (const hash of hashes) {
        const element = document.getElementById(hash.substring(1));
        if (element && window.scrollY >= element.offsetTop - window.innerHeight / 3) {
          current = hash;
        }
      }
      
      if (window.scrollY < 100) {
        current = "#";
      }
      
      setActiveHash(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        <ul className="hidden items-center gap-2 text-sm font-medium text-muted-foreground md:flex">
          {MARKETING_NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setActiveHash(item.href)}
                className={cn(
                  "transition-colors hover:bg-muted/80 hover:text-foreground rounded-full border px-4 py-1.5",
                  activeHash === item.href ? "bg-muted text-foreground border-border" : "border-transparent hover:border-border"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={user ? dashboardHref : "/login"}
            className="text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {user ? "Dashboard" : "Sign In"}
          </Link>
          <Button className="rounded-full shadow-sm hover:shadow-md transition-all gap-1.5 px-5">
            Contact Us <ArrowRight className="size-4" />
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
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            {MARKETING_NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => {
                    setActiveHash(item.href);
                    close();
                  }}
                  className={cn(
                    "transition-colors hover:text-foreground inline-block py-1 px-2 rounded-md",
                    activeHash === item.href && "text-foreground font-semibold bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={user ? dashboardHref : "/login"}
              onClick={close}
              className="text-sm font-semibold text-center py-2"
            >
              {user ? "Dashboard" : "Sign In"}
            </Link>
            <Button className="rounded-full gap-1.5 w-full">
              Contact Us <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
