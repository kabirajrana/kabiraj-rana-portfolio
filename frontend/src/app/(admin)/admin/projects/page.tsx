import { format } from "date-fns";

import {
  deleteProjectAction,
  deleteProjectCategoryAction,
  reorderProjectCategoriesAction,
  upsertProjectAction,
  upsertProjectCategoryAction,
  upsertProjectsPageConfigAction,
} from "@/app/(admin)/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";

type ProjectCategoryRow = Awaited<ReturnType<typeof contentRepository.listProjectCategories>>[number];
type ProjectRow = Awaited<ReturnType<typeof contentRepository.listProjects>>[number];

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;
  const pageSize = 8;

  const [projectsPageConfig, categories, projectRows, total] = await Promise.all([
    contentRepository.getProjectsPageConfig(),
    contentRepository.listProjectCategories(),
    contentRepository.listProjectsPaged({
      query: params.q,
      category: params.category,
      status: (params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined) ?? undefined,
      page,
      pageSize,
    }),
    contentRepository.listProjectsPaged({
      query: params.q,
      category: params.category,
      status: (params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined) ?? undefined,
      page,
      pageSize,
    }).then((result) => result[1]),
  ]);

  const projects = projectRows[0] as ProjectRow[];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="space-y-4 pb-8">
      <PageHeader title="Projects" description="Manage public projects page header, filter chips, and project cards." />

      <Card>
        <CardHeader>
          <CardTitle>Projects Page Header</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertProjectsPageConfigAction} className="grid gap-2 md:grid-cols-3">
            <input name="smallLabel" defaultValue={projectsPageConfig?.smallLabel ?? "PROJECTS"} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="title" defaultValue={projectsPageConfig?.title ?? "All projects."} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="subtitle" defaultValue={projectsPageConfig?.subtitle ?? ""} className="rounded-xl border border-border bg-surface p-2.5 md:col-span-2" />
            <Button type="submit">Save Header</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Categories (Filter Chips)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={upsertProjectCategoryAction} className="grid gap-2 md:grid-cols-5">
            <input name="label" placeholder="Label" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="slug" placeholder="Slug (optional)" className="rounded-xl border border-border bg-surface p-2.5" />
            <input type="number" name="sortOrder" placeholder="Sort" className="rounded-xl border border-border bg-surface p-2.5" />
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3"><input type="checkbox" name="isVisible" defaultChecked />Visible</label>
            <Button type="submit">Add Category</Button>
          </form>

          <div className="space-y-2">
            {(categories as ProjectCategoryRow[]).map((category: ProjectCategoryRow) => (
              <div key={category.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3">
                <form action={upsertProjectCategoryAction} className="grid flex-1 gap-2 md:grid-cols-5">
                  <input type="hidden" name="id" value={category.id} />
                  <input name="label" defaultValue={category.label} className="rounded-xl border border-border bg-surface p-2" />
                  <input name="slug" defaultValue={category.slug} className="rounded-xl border border-border bg-surface p-2" />
                  <input type="number" name="sortOrder" defaultValue={category.sortOrder} className="rounded-xl border border-border bg-surface p-2" />
                  <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3"><input type="checkbox" name="isVisible" defaultChecked={category.isVisible} />Visible</label>
                  <Button type="submit" size="sm" variant="outline">Save</Button>
                </form>
                <form action={async () => {
                  "use server";
                  await deleteProjectCategoryAction(category.id);
                }}>
                  <Button type="submit" size="sm">Delete</Button>
                </form>
              </div>
            ))}
          </div>

          <form action={async () => {
            "use server";
            await reorderProjectCategoriesAction((categories as ProjectCategoryRow[]).map((c: ProjectCategoryRow) => c.id));
          }}>
            <Button type="submit" variant="outline">Apply Current Order</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertProjectAction} className="grid gap-2 md:grid-cols-3">
            <input name="title" required placeholder="Title" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="year" placeholder="Year" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="category" placeholder="Category label" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="summary" required placeholder="Summary" className="rounded-xl border border-border bg-surface p-2.5 md:col-span-2" />
            <input name="tags" placeholder="tags, comma, separated" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="techStack" placeholder="tech stack" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="githubUrl" placeholder="GitHub URL" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="liveUrl" placeholder="Live URL" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="highlights" placeholder="highlights" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="screenshots" placeholder="screenshot URLs" className="rounded-xl border border-border bg-surface p-2.5" />
            <textarea name="description" required placeholder="Description" className="rounded-xl border border-border bg-surface p-2.5 md:col-span-3" />
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5"><input type="checkbox" name="featured" />Featured</label>
            <input type="number" name="sortOrder" defaultValue={0} className="rounded-xl border border-border bg-surface p-2.5" />
            <div className="flex flex-wrap gap-2 md:col-span-3">
              <Button type="submit" name="status" value="DRAFT" variant="outline">Save Draft</Button>
              <Button type="submit" name="status" value="PUBLISHED">Publish</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="grid gap-2 md:grid-cols-4" method="get">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search" className="rounded-xl border border-border bg-surface p-2.5" />
            <select name="status" defaultValue={params.status ?? ""} className="rounded-xl border border-border bg-surface p-2.5">
              <option value="">All status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select name="category" defaultValue={params.category ?? "all"} className="rounded-xl border border-border bg-surface p-2.5">
              <option value="all">All categories</option>
              {(categories as ProjectCategoryRow[]).map((category: ProjectCategoryRow) => (
                <option key={category.id} value={category.label}>{category.label}</option>
              ))}
            </select>
            <Button type="submit" variant="outline">Apply</Button>
          </form>

          <DataTable<ProjectRow>
            rows={projects}
            emptyLabel="No projects found"
            columns={[
              {
                key: "title",
                header: "Title",
                render: (row) => <div className="space-y-1"><p className="font-medium">{row.title}</p><p className="text-xs text-muted">{row.slug}</p></div>,
              },
              { key: "category", header: "Category", render: (row) => row.category },
              { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
              { key: "updated", header: "Updated", render: (row) => format(row.updatedAt, "MMM d, yyyy") },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <ConfirmDialog
                    triggerLabel="Delete"
                    title="Delete project"
                    description="This action cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={async () => {
                      "use server";
                      await deleteProjectAction(row.id);
                    }}
                  />
                ),
              },
            ]}
          />

          <div className="flex items-center justify-end gap-2">
            <a href={`?${new URLSearchParams({ ...params, page: String(Math.max(1, page - 1)) } as Record<string, string>).toString()}`} className="rounded-xl border border-border px-3 py-2 text-sm">Prev</a>
            <span className="text-sm text-muted">Page {page} / {totalPages}</span>
            <a href={`?${new URLSearchParams({ ...params, page: String(Math.min(totalPages, page + 1)) } as Record<string, string>).toString()}`} className="rounded-xl border border-border px-3 py-2 text-sm">Next</a>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
