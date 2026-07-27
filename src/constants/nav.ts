import type { SidebarSection } from "@/components/app/app-sidebar";
import type { RoleName } from "@/types/api";

export function getSidebarSections(role: RoleName | undefined): SidebarSection[] {
  const items =
    role === "teacher"
      ? [
          { label: "My Classes", href: "/classrooms", icon: "courses" as const },
          { label: "Analytics", href: "/analytics", icon: "performance" as const },
        ]
      : [
          { label: "My Classes", href: "/classrooms", icon: "courses" as const },
          { label: "AI Tutor", href: "/tutor", icon: "ai-tutor" as const },
          { label: "Analytics", href: "/analytics", icon: "performance" as const },
        ];

  return [{ label: "Menu", items }];
}
