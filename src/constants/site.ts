import type { NavItem } from "@/types";

export const SITE_CONFIG = {
  name: "Relearn",
  description:
    "AI-powered LMS with a Socratic AI Tutor, learning twin analytics, and teacher intelligence.",
};

export const NAV_ITEMS: NavItem[] = [
  { label: "AI Tutor", href: "/tutor" },
  { label: "Student Profile", href: "/profile" },
  { label: "Teacher Dashboard", href: "/teacher" },
  { label: "Platform Features", href: "/features" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Contact", href: "#contact" },
];
