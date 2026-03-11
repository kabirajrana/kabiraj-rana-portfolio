import { format } from "date-fns";

import {
  deleteExperienceAction,
  upsertExperienceAction,
  upsertExperiencePageConfigAction,
} from "@/app/(admin)/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CredentialsManager } from "@/components/admin/CredentialsManager";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";

type ExperienceRow = Awaited<ReturnType<typeof contentRepository.listExperience>>[number];

export default async function AdminExperiencePage() {
  const [config, items, certifications] = await Promise.all([
    contentRepository.getExperiencePageConfig(),
    contentRepository.listExperience(),
    contentRepository.listAllCertifications(),
  ]);

  return (
    <section className="space-y-4 pb-8">
      <PageHeader title="Experience" description="Control public experience header, timeline, and certifications blocks." />

      <Card>
        <CardHeader>
          <CardTitle>Experience Page Header & Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertExperiencePageConfigAction} className="grid gap-2 md:grid-cols-3">
            <input name="smallLabel" defaultValue={config?.smallLabel ?? "EXPERIENCE"} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="title" defaultValue={config?.title ?? ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="subtitle" defaultValue={config?.subtitle ?? ""} className="rounded-xl border border-border bg-surface p-2.5 md:col-span-3" />
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"><input type="checkbox" name="showTimeline" defaultChecked={config?.showTimeline ?? true} />Show Timeline</label>
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"><input type="checkbox" name="showCertifications" defaultChecked={config?.showCertifications ?? true} />Show Certifications</label>
            <input name="certTitle" defaultValue={config?.certTitle ?? ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="certSubtitle" defaultValue={config?.certSubtitle ?? ""} className="rounded-xl border border-border bg-surface p-2.5 md:col-span-2" />
            <Button type="submit">Save Page Settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Timeline Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertExperienceAction} className="grid gap-2 md:grid-cols-3">
            <input name="timeframe" placeholder="2021 – Present" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="role" placeholder="Role" className="rounded-xl border border-border bg-surface p-2.5" required />
            <input name="org" placeholder="Organization" className="rounded-xl border border-border bg-surface p-2.5" required />
            <input name="summary" placeholder="Summary" className="rounded-xl border border-border bg-surface p-2.5 md:col-span-3" />
            <input name="location" placeholder="Location" className="rounded-xl border border-border bg-surface p-2.5" defaultValue="Remote" required />
            <input type="date" name="startDate" className="rounded-xl border border-border bg-surface p-2.5" required />
            <input type="date" name="endDate" className="rounded-xl border border-border bg-surface p-2.5" />
            <select name="sidePlacement" className="rounded-xl border border-border bg-surface p-2.5">
              <option value="AUTO">Auto</option>
              <option value="LEFT">Left</option>
              <option value="RIGHT">Right</option>
            </select>
            <input name="achievements" placeholder="Achievement bullets" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="techStack" placeholder="Tags/chips" className="rounded-xl border border-border bg-surface p-2.5" />
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"><input type="checkbox" name="currentRole" />Current Role</label>
            <div className="flex flex-wrap gap-2 md:col-span-3">
              <Button type="submit" name="status" value="DRAFT" variant="outline">Save Draft</Button>
              <Button type="submit" name="status" value="PUBLISHED">Publish</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable<ExperienceRow>
        rows={items}
        emptyLabel="No experience entries"
        columns={[
          { key: "role", header: "Role", render: (row) => <p className="font-medium">{row.role} · {row.org}</p> },
          { key: "timeframe", header: "Timeframe", render: (row) => row.timeframe || `${format(row.startDate, "MMM yyyy")} - ${row.endDate ? format(row.endDate, "MMM yyyy") : "Present"}` },
          { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <ConfirmDialog
                triggerLabel="Delete"
                title="Delete experience"
                description="This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={async () => {
                  "use server";
                  await deleteExperienceAction(row.id);
                }}
              />
            ),
          },
        ]}
      />

      <CredentialsManager rows={certifications} />
    </section>
  );
}
