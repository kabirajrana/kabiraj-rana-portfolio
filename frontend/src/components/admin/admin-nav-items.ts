import { Brain, ChartColumnBig, FileText, FolderKanban, Gauge, Home, Image, Inbox, Info, LayoutGrid, Settings } from "lucide-react";

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/admin/home", label: "Home", icon: Home },
  { href: "/admin/about", label: "About", icon: Info },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: LayoutGrid },
  { href: "/admin/research", label: "Research", icon: Brain },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/resume", label: "Resume", icon: FileText },
  { href: "/admin/seo", label: "SEO", icon: ChartColumnBig },
  { href: "/admin/analytics", label: "Analytics", icon: ChartColumnBig },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;
