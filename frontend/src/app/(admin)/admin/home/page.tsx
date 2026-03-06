import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";

import { enablePreviewAction, saveHomeAction } from "../actions";

type ProjectItem = Awaited<ReturnType<typeof contentRepository.listProjects>>[number];

export default async function AdminHomePage() {
  const [home, projects] = await Promise.all([contentRepository.getHomeContent(), contentRepository.listProjects()]);
  const data = (home?.draftJson as Record<string, unknown> | null) ?? {};

  return (
    <section className="pb-8">
      <PageHeader title="Home Manager" description="Manage hero copy, CTAs, featured projects, and section visibility." />

      <form action={saveHomeAction} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Hero Content</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <input name="heroTitle" defaultValue={String(data.heroTitle ?? "")} placeholder="Hero title" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="heroSubtitle" defaultValue={String(data.heroSubtitle ?? "")} placeholder="Hero subtitle" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="heroTagline" defaultValue={String(data.heroTagline ?? "")} placeholder="Tagline" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="ctas" defaultValue={Array.isArray(data.ctas) ? data.ctas.join(", ") : ""} placeholder="CTAs (comma-separated label:url)" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="techHighlights" defaultValue={Array.isArray(data.techHighlights) ? data.techHighlights.join(", ") : ""} placeholder="Tech highlights" className="rounded-xl border border-border bg-surface p-2.5" />
            <input
              name="featuredProjectIds"
              defaultValue={Array.isArray(data.featuredProjectIds) ? data.featuredProjectIds.join(", ") : ""}
              placeholder="Featured project IDs"
              className="rounded-xl border border-border bg-surface p-2.5"
            />
            <div className="grid gap-2 text-sm text-muted">
              <label className="flex items-center gap-2"><input type="checkbox" name="showProjects" defaultChecked />Show Projects</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="showResearch" defaultChecked />Show Research</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="showExperience" defaultChecked />Show Experience</label>
            </div>
            <input type="datetime-local" name="scheduledAt" className="rounded-xl border border-border bg-surface p-2.5" />
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" type="submit" name="status" value="DRAFT" variant="outline">Save Draft</Button>
              <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" type="submit" name="status" value="PUBLISHED">Publish</Button>
              <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" type="submit" name="status" value="SCHEDULED" variant="outline">Schedule</Button>
              <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" type="submit" formAction={enablePreviewAction} variant="outline">Preview</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/70 bg-surface-2/40 p-4">
              <p className="text-xs uppercase tracking-wide text-accent">Public Preview</p>
              <h3 className="mt-2 text-xl font-semibold">{String(data.heroTitle ?? "Your hero title")}</h3>
              <p className="mt-1 text-sm text-muted">{String(data.heroSubtitle ?? "Your subtitle")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {projects.slice(0, 5).map((project: ProjectItem) => (
                  <span key={project.id} className="rounded-full border border-border/70 px-2 py-1 text-xs">{project.title}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </section>
  );
}
