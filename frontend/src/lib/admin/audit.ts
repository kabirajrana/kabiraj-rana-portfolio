import { headers } from "next/headers";

import { createAuditLog } from "@/lib/db/audit-log";

type Input = {
  actorAdminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

export async function logAdminAction(input: Input) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for") ?? "local";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";

  await createAuditLog({
    actorId: input.actorAdminId,
    action: input.action,
    resource: input.entityType,
    resourceId: input.entityId,
    metadata: {
      summary: input.summary,
      entityType: input.entityType,
      entityId: input.entityId,
      ip,
      userAgent,
      ...input.metadata,
    },
    actorAdminId: input.actorAdminId,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    ip,
    userAgent,
  });
}
