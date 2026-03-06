import { format } from "date-fns";

import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { contentRepository } from "@/lib/db/repositories";

type AuditLogRow = Awaited<ReturnType<typeof contentRepository.listAuditLogs>>[number];

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; action?: string; startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;

  const logs = await contentRepository.listAuditLogs({
    entityType: params.entityType || undefined,
    action: params.action || undefined,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
  });

  return (
    <section className="space-y-4 pb-8">
      <PageHeader title="Audit Log" description="Track create, update, delete, publish, schedule and system actions." />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-2 md:grid-cols-5">
            <input name="entityType" placeholder="Entity type" defaultValue={params.entityType ?? ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="action" placeholder="Action" defaultValue={params.action ?? ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="startDate" type="date" defaultValue={params.startDate ?? ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="endDate" type="date" defaultValue={params.endDate ?? ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <Button type="submit" variant="outline">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <DataTable<AuditLogRow>
        rows={logs}
        emptyLabel="No audit entries"
        columns={[
          { key: "time", header: "Time", render: (row) => format(row.createdAt, "MMM d, yyyy HH:mm") },
          { key: "actor", header: "Actor", render: (row) => row.actor?.name ?? row.actor?.email ?? "System" },
          { key: "action", header: "Action", render: (row) => <Badge>{row.action}</Badge> },
          { key: "entity", header: "Entity", render: (row) => row.entityType ?? row.resource },
          {
            key: "detail",
            header: "Detail",
            render: (row) => (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">View</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{row.summary ?? `${row.action} ${row.entityType ?? row.resource}`}</DialogTitle>
                    <DialogDescription>{format(row.createdAt, "PPpp")}</DialogDescription>
                  </DialogHeader>
                  <pre className="max-h-80 overflow-auto rounded-xl border border-border bg-surface p-3 text-xs text-muted">{JSON.stringify(row.metadata ?? {}, null, 2)}</pre>
                </DialogContent>
              </Dialog>
            ),
          },
        ]}
      />
    </section>
  );
}
