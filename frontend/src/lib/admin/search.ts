import { contentRepository } from "@/lib/db/repositories";

export type AdminSearchGroup = "Projects" | "Research" | "Experience" | "Messages" | "Media" | "Actions";

export type AdminSearchItem = {
  group: AdminSearchGroup;
  label: string;
  href: string;
  subtitle?: string;
};

const quickActions: AdminSearchItem[] = [
  { group: "Actions", label: "New Project", href: "/admin/projects" },
  { group: "Actions", label: "New Research", href: "/admin/research" },
  { group: "Actions", label: "Go to Settings", href: "/admin/settings" },
];

export async function searchAdmin(query: string): Promise<AdminSearchItem[]> {
  const normalized = query.trim();
  if (normalized.length < 2) {
    return quickActions;
  }

  const [projects, research, experience, messages, media] = await Promise.all([
    contentRepository.listProjects(),
    contentRepository.listResearch(),
    contentRepository.listExperience(),
    contentRepository.listMessages(),
    contentRepository.listMedia(),
  ]);

  type ProjectItem = (typeof projects)[number];
  type ResearchItem = (typeof research)[number];
  type ExperienceItem = (typeof experience)[number];
  type MessageItem = (typeof messages)[number];
  type MediaItem = (typeof media)[number];

  return [
    ...quickActions,
    ...projects
      .filter((item: ProjectItem) => `${item.title ?? ""} ${item.summary ?? ""}`.toLowerCase().includes(normalized.toLowerCase()))
      .slice(0, 6)
      .map((item: ProjectItem) => ({ group: "Projects" as const, label: String(item.title ?? "Untitled"), href: "/admin/projects", subtitle: String(item.status ?? "") })),
    ...research
      .filter((item: ResearchItem) => `${item.title ?? ""} ${item.summary ?? ""}`.toLowerCase().includes(normalized.toLowerCase()))
      .slice(0, 6)
      .map((item: ResearchItem) => ({ group: "Research" as const, label: String(item.title ?? "Untitled"), href: "/admin/research", subtitle: String(item.status ?? "") })),
    ...experience
      .filter((item: ExperienceItem) => `${item.role ?? ""} ${item.org ?? ""}`.toLowerCase().includes(normalized.toLowerCase()))
      .slice(0, 6)
      .map((item: ExperienceItem) => ({ group: "Experience" as const, label: `${String(item.role ?? "Role")} @ ${String(item.org ?? "Org")}`, href: "/admin/experience", subtitle: String(item.status ?? "") })),
    ...messages
      .filter((item: MessageItem) => `${item.sender ?? ""} ${item.subject ?? ""}`.toLowerCase().includes(normalized.toLowerCase()))
      .slice(0, 6)
      .map((item: MessageItem) => ({ group: "Messages" as const, label: String(item.subject ?? "Message"), href: "/admin/messages", subtitle: `${String(item.sender ?? "Unknown")} · ${String(item.status ?? "")}` })),
    ...media
      .filter((item: MediaItem) => `${item.key ?? ""} ${item.url ?? ""}`.toLowerCase().includes(normalized.toLowerCase()))
      .slice(0, 6)
      .map((item: MediaItem) => ({ group: "Media" as const, label: String(item.key ?? "Media"), href: "/admin/media", subtitle: String(item.type ?? "") })),
  ];
}
