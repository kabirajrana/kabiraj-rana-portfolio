import { prisma } from "@/lib/db/prisma";
import { researchDelegate } from "@/lib/db/research-delegate";

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
    prisma.project.findMany({
      where: { OR: [{ title: { contains: normalized, mode: "insensitive" } }, { summary: { contains: normalized, mode: "insensitive" } }] },
      select: { title: true, status: true },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),
    researchDelegate.findMany({
      where: { OR: [{ title: { contains: normalized, mode: "insensitive" } }, { summary: { contains: normalized, mode: "insensitive" } }] },
      select: { title: true, status: true },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.experience.findMany({
      where: { OR: [{ role: { contains: normalized, mode: "insensitive" } }, { org: { contains: normalized, mode: "insensitive" } }] },
      select: { role: true, org: true, status: true },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.message.findMany({
      where: { OR: [{ sender: { contains: normalized, mode: "insensitive" } }, { subject: { contains: normalized, mode: "insensitive" } }] },
      select: { sender: true, subject: true, status: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.mediaAsset.findMany({
      where: { OR: [{ key: { contains: normalized, mode: "insensitive" } }, { url: { contains: normalized, mode: "insensitive" } }] },
      select: { key: true, type: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  type ProjectItem = (typeof projects)[number];
  type ResearchItem = (typeof research)[number];
  type ExperienceItem = (typeof experience)[number];
  type MessageItem = (typeof messages)[number];
  type MediaItem = (typeof media)[number];

  return [
    ...quickActions,
    ...projects.map((item: ProjectItem) => ({ group: "Projects" as const, label: item.title, href: "/admin/projects", subtitle: item.status })),
    ...research.map((item: ResearchItem) => ({ group: "Research" as const, label: item.title, href: "/admin/research", subtitle: item.status })),
    ...experience.map((item: ExperienceItem) => ({ group: "Experience" as const, label: `${item.role} @ ${item.org}`, href: "/admin/experience", subtitle: item.status })),
    ...messages.map((item: MessageItem) => ({ group: "Messages" as const, label: item.subject, href: "/admin/messages", subtitle: `${item.sender} · ${item.status}` })),
    ...media.map((item: MediaItem) => ({ group: "Media" as const, label: item.key, href: "/admin/media", subtitle: item.type })),
  ];
}
