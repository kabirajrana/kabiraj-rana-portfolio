import { backendApiRequest } from "@/lib/backend-api";

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
  await backendApiRequest("/v1/admin/audit-logs", {
    method: "POST",
    body: JSON.stringify({
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
      metadata: input.metadata ?? null,
    }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
}
