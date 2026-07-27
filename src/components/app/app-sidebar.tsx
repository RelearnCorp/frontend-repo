"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BotMessageSquare,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
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
import { Eyebrow, Muted } from "@/components/ui/typography";
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
  courses: GraduationCap,
  "ai-tutor": BotMessageSquare,
  overview: LayoutDashboard,
  performance: Zap,
  reports: ScrollText,
} as const;

export type SidebarIconName = keyof typeof SIDEBAR_ICONS;

export type SidebarItem = {
  label: string;
  href: string;
  icon: SidebarIconName;
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
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          <Eyebrow className="px-3 pb-2 font-semibold">
            {section.label}
          </Eyebrow>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = SIDEBAR_ICONS[item.icon];
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
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
            <Muted className="truncate text-xs">{user.role}</Muted>
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
