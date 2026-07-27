import type { SidebarSection } from "@/components/app/app-sidebar";
import type { RoleName } from "@/types/api";

export function getSidebarSections(role: RoleName | undefined): SidebarSection[] {
  const items =
    role === "teacher"
      ? [
          { label: "Overview", href: "/teacher", icon: "overview" as const },
          { label: "My Classes", href: "/classes", icon: "courses" as const },
        ]
      : [
          { label: "My Classes", href: "/classes", icon: "courses" as const },
          { label: "AI Tutor", href: "/tutor", icon: "ai-tutor" as const },
          { label: "My Progress", href: "/progress", icon: "performance" as const },
          { label: "Quiz Results", href: "/results", icon: "reports" as const },
        ];

  return [{ label: "Menu", items }];
}
