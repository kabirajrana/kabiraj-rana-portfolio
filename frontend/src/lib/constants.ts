export const SITE = {
  name: "Kabiraj Rana",
  description:
    "AI engineer building scalable ML systems, LLM architectures, and intelligent AI products—delivering production-grade platforms from prototype to production.",
} as const;

type NavItem = { label: string; href: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/about#experience" },
  { label: "Contact", href: "/contact" },
];

export const NAV_PILL = {
  label: "Let’s Talk",
  href: "/#contact",
} as const;

export const SOCIAL_LINKS: Array<{ label: string; href: string }> = [];
