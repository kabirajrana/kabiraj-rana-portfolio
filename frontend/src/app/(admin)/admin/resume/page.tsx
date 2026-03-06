import { activateResumeAction } from "@/app/(admin)/admin/actions";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";
import { ResumeUploadPanel } from "@/app/(admin)/admin/resume/resume-upload-panel";

type ResumeRow = Awaited<ReturnType<typeof contentRepository.listResumes>>[number];

export default async function AdminResumePage() {
  const resumes = await contentRepository.listResumes();

  return (
    <section className="pb-8">
      <PageHeader title="Resume Manager" description="Upload resume versions, set active file, and track downloads." />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upload Resume Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUploadPanel />
        </CardContent>
      </Card>

      <DataTable<ResumeRow>
        rows={resumes}
        emptyLabel="No resume uploaded"
        columns={[
          { key: "label", header: "Label", render: (row) => row.label },
          { key: "url", header: "URL", render: (row) => <a href={row.url} className="text-accent">Open</a> },
          { key: "active", header: "Active", render: (row) => (row.isActive ? <Badge>Active</Badge> : <span className="text-muted">No</span>) },
          { key: "downloads", header: "Downloads", render: (row) => row.downloadCount },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <form action={async () => {
                "use server";
                await activateResumeAction(row.id);
              }}>
                <Button type="submit" size="sm" variant="outline">Set Active</Button>
              </form>
            ),
          },
        ]}
      />
    </section>
  );
}
