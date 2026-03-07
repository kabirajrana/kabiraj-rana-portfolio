import { backendApiRequest } from "@/lib/backend-api";

export async function createContentRevision(input: {
  entityType: "Project" | "Experience" | "Research" | "SiteContent";
  entityId: string;
  action: "CREATE" | "UPDATE" | "PUBLISH" | "UNPUBLISH" | "SCHEDULE" | "RESTORE";
  actorAdminId?: string;
  snapshot: unknown;
}) {
  const response = await backendApiRequest<Record<string, unknown>>("/v1/admin/revisions", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  return response ?? { ...input, id: `revision-${Date.now()}`, versionNumber: 1, createdAt: new Date() };
}

export async function listContentRevisions(entityType: string, entityId: string) {
  const response = await backendApiRequest<Array<Record<string, unknown>>>(
    `/v1/admin/revisions?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
    { method: "GET" },
  );

  return response ?? [];
}

export async function restoreContentRevision(revisionId: string, actorAdminId?: string) {
  const response = await backendApiRequest<{ entityType: string; entityId: string }>(`/v1/admin/revisions/${encodeURIComponent(revisionId)}/restore`, {
    method: "POST",
    body: JSON.stringify({ actorAdminId }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response) {
    throw new Error("Failed to restore revision");
  }

  return response;
}
