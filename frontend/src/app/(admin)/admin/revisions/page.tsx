import { format } from "date-fns";

import { restoreRevisionAction } from "@/app/(admin)/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function AdminRevisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; entityId?: string }>;
}) {
  const params = await searchParams;
  const entityType = params.entityType ?? "Project";
  const entityId = params.entityId ?? "";

  const revisions = entityId
    ? await prisma.contentRevision.findMany({
        where: { entityType, entityId },
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { email: true, name: true } } },
      })
    : [];

  return (
    <section className="space-y-4 pb-8">
      <PageHeader title="Revisions" description="View snapshot history and restore a previous state." />

      <Card>
        <CardHeader>
          <CardTitle>Revision History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entityId ? <p className="text-sm text-muted">{entityType} · {entityId}</p> : <p className="text-sm text-muted">Select an entity from content tables.</p>}

          {revisions.length ? (
            revisions.map((item: (typeof revisions)[number]) => (
              <div key={item.id} className="rounded-xl border border-border/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">v{item.versionNumber} · {item.action}</p>
                  <p className="text-xs text-muted">{format(item.createdAt, "PPpp")}</p>
                </div>
                <p className="text-xs text-muted">by {item.actor?.name ?? item.actor?.email ?? "System"}</p>
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-border bg-surface p-2 text-xs text-muted">{JSON.stringify(item.snapshot, null, 2)}</pre>
                <form action={async () => {
                  "use server";
                  await restoreRevisionAction(item.id);
                }} className="mt-2">
                  <Button type="submit" size="sm" variant="outline">Restore this version</Button>
                </form>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted">No revisions found.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
