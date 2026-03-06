import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";
import { MediaUploadPanel } from "@/app/(admin)/admin/media/media-upload-panel";

type MediaRow = Awaited<ReturnType<typeof contentRepository.listMedia>>[number];

export default async function AdminMediaPage() {
  const items = await contentRepository.listMedia();

  return (
    <section className="pb-8">
      <PageHeader title="Media Library" description="Manage uploaded assets, tags, and usage references across modules." />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add Media Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUploadPanel />
        </CardContent>
      </Card>

      <DataTable<MediaRow>
        rows={items}
        emptyLabel="No assets"
        columns={[
          { key: "key", header: "Key", render: (row) => row.key },
          { key: "url", header: "URL", render: (row) => <a href={row.url} className="text-accent" target="_blank">Open</a> },
          { key: "type", header: "Type", render: (row) => row.type },
          { key: "size", header: "Size", render: (row) => `${Math.round(row.size / 1024)} KB` },
        ]}
      />
    </section>
  );
}
