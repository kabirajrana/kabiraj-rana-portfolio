import { prisma } from "@/lib/db/prisma";
import { researchDelegate } from "@/lib/db/research-delegate";

export async function createContentRevision(input: {
  entityType: "Project" | "Experience" | "Research" | "SiteContent";
  entityId: string;
  action: "CREATE" | "UPDATE" | "PUBLISH" | "UNPUBLISH" | "SCHEDULE" | "RESTORE";
  actorAdminId?: string;
  snapshot: unknown;
}) {
  const last = await prisma.contentRevision.findFirst({
    where: { entityType: input.entityType, entityId: input.entityId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  return prisma.contentRevision.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      snapshot: input.snapshot as never,
      actorAdminId: input.actorAdminId,
      versionNumber: (last?.versionNumber ?? 0) + 1,
    },
  });
}

export async function listContentRevisions(entityType: string, entityId: string) {
  return prisma.contentRevision.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { email: true, name: true } } },
  });
}

export async function restoreContentRevision(revisionId: string, actorAdminId?: string) {
  const revision = await prisma.contentRevision.findUnique({ where: { id: revisionId } });
  if (!revision) {
    throw new Error("Revision not found");
  }

  const snapshot = revision.snapshot as Record<string, unknown>;

  if (revision.entityType === "Project") {
    const restored = await prisma.project.update({
      where: { id: revision.entityId },
      data: snapshot as never,
    });
    await createContentRevision({
      entityType: "Project",
      entityId: restored.id,
      action: "RESTORE",
      actorAdminId,
      snapshot,
    });
    return { entityType: revision.entityType, entityId: restored.id };
  }

  if (revision.entityType === "Experience") {
    const restored = await prisma.experience.update({ where: { id: revision.entityId }, data: snapshot as never });
    await createContentRevision({ entityType: "Experience", entityId: restored.id, action: "RESTORE", actorAdminId, snapshot });
    return { entityType: revision.entityType, entityId: restored.id };
  }

  if (revision.entityType === "Research") {
    const restored = await researchDelegate.update({ where: { id: revision.entityId }, data: snapshot as never });
    await createContentRevision({ entityType: "Research", entityId: restored.id, action: "RESTORE", actorAdminId, snapshot });
    return { entityType: revision.entityType, entityId: restored.id };
  }

  if (revision.entityType === "SiteContent") {
    const restored = await prisma.siteContent.update({
      where: { id: revision.entityId },
      data: snapshot as never,
    });
    await createContentRevision({ entityType: "SiteContent", entityId: restored.id, action: "RESTORE", actorAdminId, snapshot });
    return { entityType: revision.entityType, entityId: restored.id };
  }

  throw new Error("Unsupported revision entity type");
}
