"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  BotMessageSquare,
  BrainCircuit,
  ChartLine,
  ClipboardList,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  Library,
  Lightbulb,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import {
  InitialsAvatar,
  type AvatarTone,
} from "@/components/app/initials-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Icons are referenced by name (not component) so server pages can pass
 * sidebar config across the client-component boundary.
 */
const SIDEBAR_ICONS = {
  home: Home,
  courses: GraduationCap,
  assignments: ClipboardList,
  "ai-tutor": BotMessageSquare,
  profile: UserRound,
  settings: Settings,
  overview: LayoutDashboard,
  intelligence: BrainCircuit,
  roster: Users,
  curriculum: Library,
  performance: Zap,
  reports: ScrollText,
  "core-lms": Layers,
  "tutor-module": Bot,
  analytics: ChartLine,
  buddy: Lightbulb,
} as const;

export type SidebarIconName = keyof typeof SIDEBAR_ICONS;

export type SidebarItem = {
  label: string;
  href: string;
  icon: SidebarIconName;
  active?: boolean;
  /** Nav destination isn't built yet — render as non-interactive instead of a dead link. */
  disabled?: boolean;
};

export type SidebarSection = {
  label: string;
  items: SidebarItem[];
};

export type SidebarUser = {
  name: string;
  role: string;
  tone?: AvatarTone;
};

function SidebarBrand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        R
      </span>
      <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
        Relearn
      </span>
    </Link>
  );
}

function SidebarNav({ sections }: { sections: SidebarSection[] }) {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const hashItems = sections
      .flatMap((s) => s.items)
      .filter((item) => !item.disabled && item.href.startsWith("#"));
    if (hashItems.length === 0) return;

    const handleScroll = () => {
      let current = "";
      for (const item of hashItems) {
        const id = item.href.substring(1);
        const element = document.getElementById(id);
        if (element && window.scrollY >= element.offsetTop - window.innerHeight / 3) {
          current = item.href;
        }
      }
      
      if (window.scrollY < 100 && hashItems.length > 0) {
        current = hashItems[0].href;
      }
      
      setActiveHash(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = SIDEBAR_ICONS[item.icon];
              const isHash = item.href.startsWith("#");
              // Use activeHash if it's a hash link, otherwise fallback to item.active
              const isActive = isHash && activeHash ? activeHash === item.href : item.active;

              if (item.disabled) {
                return (
                  <li key={item.label}>
                    <span
                      aria-disabled="true"
                      title="Coming soon"
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      if (isHash) setActiveHash(item.href);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarUserCard({ user }: { user: SidebarUser }) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="p-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border p-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <InitialsAvatar name={user.name} tone={user.tone ?? "slate"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.role}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AppSidebar({
  sections,
  user: defaultUser,
}: {
  sections: SidebarSection[];
  user?: SidebarUser;
}) {
  const auth = useAuth();
  const user = defaultUser ?? {
    name: auth.user?.full_name ?? "Guest",
    role: auth.user?.role?.name ?? "Student",
    tone: "slate" as const,
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarBrand />
        <SidebarNav sections={sections} />
        <SidebarUserCard user={user} />
      </aside>

      {/* Mobile: floating trigger + sheet drawer (sidebar is hidden < lg) */}
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Open navigation"
              className="fixed right-4 bottom-4 z-50 rounded-full shadow-lg lg:hidden"
            />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Relearn app navigation</SheetDescription>
          </SheetHeader>
          <SidebarBrand />
          <SidebarNav sections={sections} />
          <SidebarUserCard user={user} />
        </SheetContent>
      </Sheet>
    </>
  );
}
