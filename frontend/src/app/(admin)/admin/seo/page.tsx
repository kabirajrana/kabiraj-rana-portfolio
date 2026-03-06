import { upsertSeoAction } from "@/app/(admin)/admin/actions";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";

type SeoRow = Awaited<ReturnType<typeof contentRepository.listSeoConfigs>>[number];

export default async function AdminSeoPage() {
  const configs = await contentRepository.listSeoConfigs();

  return (
    <section className="pb-8">
      <PageHeader title="SEO Manager" description="Per-page metadata controls including OG image and canonical URLs." />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upsert Page SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertSeoAction} className="grid gap-2 md:grid-cols-2">
            <input name="pageKey" placeholder="home / projects / research" className="rounded-xl border border-border bg-surface p-2.5" required />
            <input name="metaTitle" placeholder="Meta title" className="rounded-xl border border-border bg-surface p-2.5" required />
            <input name="metaDescription" placeholder="Meta description" className="rounded-xl border border-border bg-surface p-2.5 md:col-span-2" required />
            <input name="ogImage" placeholder="OG image URL" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="canonical" placeholder="Canonical URL" className="rounded-xl border border-border bg-surface p-2.5" />
            <Button type="submit" className="md:col-span-2">Save SEO</Button>
          </form>
        </CardContent>
      </Card>

      <DataTable<SeoRow>
        rows={configs}
        emptyLabel="No SEO records"
        columns={[
          { key: "page", header: "Page", render: (row) => row.pageKey },
          { key: "title", header: "Meta Title", render: (row) => row.metaTitle },
          { key: "desc", header: "Description", render: (row) => <p className="line-clamp-1">{row.metaDescription}</p> },
        ]}
      />
    </section>
  );
}
