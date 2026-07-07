import type { NavItem } from "@/types";

export const SITE_CONFIG = {
  name: "Relearn",
  description: "A modern SaaS starter built with Next.js and shadcn/ui.",
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Contact", href: "#contact" },
];
