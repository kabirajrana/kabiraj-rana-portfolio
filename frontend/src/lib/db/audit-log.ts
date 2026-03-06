import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function createAuditLog(input: {
  actorId?: string;
  actorAdminId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorAdminId: input.actorAdminId ?? input.actorId,
      action: input.action,
      entityType: input.entityType ?? input.resource,
      entityId: input.entityId ?? input.resourceId,
      summary: input.summary,
      ip: input.ip,
      userAgent: input.userAgent,
      resource: input.resource,
      resourceId: input.resourceId,
      metadata: input.metadata as Prisma.InputJsonValue,
    },
  });
}
