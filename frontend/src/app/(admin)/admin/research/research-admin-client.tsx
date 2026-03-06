"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { deleteResearchAction, upsertResearchAction } from "@/app/(admin)/admin/actions";
import { DataTable } from "@/components/admin/DataTable";
import { ResearchDetailRenderer } from "@/components/research/research-detail-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ResearchType } from "@/lib/research/types";
import type { PublicResearchEntry } from "@/types/research";

const TYPES: ResearchType[] = ["EXPERIMENT", "PAPER", "SYSTEM", "THESIS", "NOTE"];
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

type EditorState = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  type: ResearchType;
  category: string;
  tags: string;
  year: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  authors: string;
  affiliation: string;
  researchArea: string;
  dataset: string;
  duration: string;
  coverImage: string;
  codeUrl: string;
  pdfUrl: string;
  demoUrl: string;
  notesUrl: string;
  citation: string;
  referencesJson: string;
  relatedSlugs: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  content: Record<string, string>;
};

const TYPE_FIELDS: Record<ResearchType, Array<{ key: string; label: string }>> = {
  EXPERIMENT: [
    { key: "objective", label: "Objective" },
    { key: "dataset", label: "Dataset" },
    { key: "method", label: "Method" },
    { key: "metrics", label: "Metrics" },
    { key: "results", label: "Results" },
    { key: "keyInsight", label: "Key Insight" },
    { key: "limitations", label: "Limitations" },
    { key: "nextSteps", label: "Next Steps" },
  ],
  PAPER: [
    { key: "abstract", label: "Abstract" },
    { key: "introduction", label: "Introduction" },
    { key: "problemStatement", label: "Problem Statement" },
    { key: "relatedWork", label: "Related Work" },
    { key: "methodology", label: "Methodology" },
    { key: "systemArchitecture", label: "System Architecture" },
    { key: "experiments", label: "Experiments" },
    { key: "results", label: "Results" },
    { key: "discussion", label: "Discussion" },
    { key: "conclusion", label: "Conclusion" },
    { key: "futureWork", label: "Future Work" },
  ],
  SYSTEM: [
    { key: "overview", label: "Overview" },
    { key: "problem", label: "Problem" },
    { key: "systemDiagram", label: "System Diagram (Mermaid or ASCII)" },
    { key: "components", label: "Components" },
    { key: "dataFlow", label: "Data Flow" },
    { key: "architectureDecisions", label: "Architecture Decisions" },
    { key: "techStack", label: "Tech Stack" },
    { key: "evaluation", label: "Evaluation" },
    { key: "conclusion", label: "Conclusion" },
  ],
  THESIS: [
    { key: "abstract", label: "Abstract" },
    { key: "context", label: "Context" },
    { key: "researchQuestion", label: "Research Question" },
    { key: "literatureReview", label: "Literature Review" },
    { key: "methodology", label: "Methodology" },
    { key: "implementation", label: "Implementation" },
    { key: "findings", label: "Findings" },
    { key: "discussion", label: "Discussion" },
    { key: "conclusion", label: "Conclusion" },
    { key: "limitations", label: "Limitations" },
    { key: "futureWork", label: "Future Work" },
    { key: "appendix", label: "Appendix" },
  ],
  NOTE: [
    { key: "overview", label: "Overview" },
    { key: "keyIdea", label: "Key Idea" },
    { key: "explanation", label: "Explanation" },
    { key: "implications", label: "Implications" },
    { key: "references", label: "References" },
  ],
};

function emptyContent(type: ResearchType) {
  const fields = TYPE_FIELDS[type];
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}

function createDefaultState(): EditorState {
  return {
    title: "",
    slug: "",
    summary: "",
    type: "EXPERIMENT",
    category: "",
    tags: "",
    year: String(new Date().getFullYear()),
    status: "DRAFT",
    featured: false,
    authors: "Kabiraj Rana",
    affiliation: "Independent AI Research Lab",
    researchArea: "",
    dataset: "",
    duration: "",
    coverImage: "",
    codeUrl: "",
    pdfUrl: "",
    demoUrl: "",
    notesUrl: "",
    citation: "",
    referencesJson: "[]",
    relatedSlugs: "",
    seoTitle: "",
    seoDescription: "",
    publishedAt: "",
    content: emptyContent("EXPERIMENT"),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toEditorState(entry: PublicResearchEntry): EditorState {
  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    summary: entry.summary,
    type: entry.type,
    category: entry.category ?? "",
    tags: entry.tags.join(", "),
    year: String(entry.year),
    status: entry.status,
    featured: entry.featured,
    authors: entry.authors.join(", "),
    affiliation: entry.affiliation ?? "",
    researchArea: entry.researchArea ?? "",
    dataset: entry.dataset ?? "",
    duration: entry.duration ?? "",
    coverImage: entry.coverImage ?? "",
    codeUrl: entry.codeUrl ?? "",
    pdfUrl: entry.pdfUrl ?? "",
    demoUrl: entry.demoUrl ?? "",
    notesUrl: entry.notesUrl ?? "",
    citation: entry.citation ?? "",
    referencesJson: JSON.stringify(Array.isArray(entry.references) ? entry.references : [], null, 2),
    relatedSlugs: entry.relatedSlugs.join(", "),
    seoTitle: entry.seoTitle ?? "",
    seoDescription: entry.seoDescription ?? "",
    publishedAt: entry.publishedAt ? entry.publishedAt.slice(0, 16) : "",
    content: entry.content as Record<string, string>,
  };
}

function toPreviewEntry(state: EditorState): PublicResearchEntry {
  return {
    id: state.id ?? "preview",
    slug: state.slug,
    title: state.title,
    summary: state.summary,
    content: state.content as never,
    type: state.type,
    category: state.category,
    tags: state.tags.split(",").map((part) => part.trim()).filter(Boolean),
    year: Number(state.year) || new Date().getFullYear(),
    status: state.status,
    featured: state.featured,
    authors: state.authors.split(",").map((part) => part.trim()).filter(Boolean),
    affiliation: state.affiliation,
    researchArea: state.researchArea,
    dataset: state.dataset,
    duration: state.duration,
    pdfUrl: state.pdfUrl,
    codeUrl: state.codeUrl,
    demoUrl: state.demoUrl,
    notesUrl: state.notesUrl,
    coverImage: state.coverImage,
    citation: state.citation,
    references: JSON.parse(state.referencesJson || "[]"),
    relatedSlugs: state.relatedSlugs.split(",").map((part) => part.trim()).filter(Boolean),
    seoTitle: state.seoTitle,
    seoDescription: state.seoDescription,
    publishedAt: state.publishedAt ? new Date(state.publishedAt).toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function ResearchAdminClient({ entries }: { entries: PublicResearchEntry[] }) {
  const [state, setState] = useState<EditorState>(createDefaultState());
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [pending, startTransition] = useTransition();

  const preview = useMemo(() => toPreviewEntry(state), [state]);

  const allSlugs = entries.map((item) => item.slug).filter((slug) => slug !== state.slug);

  function setField<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function onTypeChange(nextType: ResearchType) {
    setState((current) => ({ ...current, type: nextType, content: emptyContent(nextType) }));
  }

  function onSubmit() {
    const data = new FormData();
    if (state.id) data.set("id", state.id);
    data.set("title", state.title);
    data.set("slug", state.slug || slugify(state.title));
    data.set("summary", state.summary);
    data.set("type", state.type);
    data.set("category", state.category);
    data.set("tags", state.tags);
    data.set("year", state.year);
    data.set("status", state.status);
    if (state.featured) data.set("featured", "on");
    data.set("authors", state.authors);
    data.set("affiliation", state.affiliation);
    data.set("researchArea", state.researchArea);
    data.set("dataset", state.dataset);
    data.set("duration", state.duration);
    data.set("coverImage", state.coverImage);
    data.set("codeUrl", state.codeUrl);
    data.set("pdfUrl", state.pdfUrl);
    data.set("demoUrl", state.demoUrl);
    data.set("notesUrl", state.notesUrl);
    data.set("citation", state.citation);
    data.set("referencesJson", state.referencesJson || "[]");
    data.set("relatedSlugs", state.relatedSlugs);
    data.set("seoTitle", state.seoTitle);
    data.set("seoDescription", state.seoDescription);
    data.set("publishedAt", state.publishedAt);
    data.set("contentJson", JSON.stringify(state.content));

    startTransition(async () => {
      try {
        await upsertResearchAction(data);
        toast.success("Research entry saved");
      } catch {
        toast.error("Failed to save research entry. Check required fields and JSON format.");
      }
    });
  }

  return (
    <section className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Research Archive Table</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={entries}
            emptyLabel="No research entries found"
            columns={[
              { key: "title", header: "Title", render: (row) => <div className="space-y-1"><p className="font-medium">{row.title}</p><p className="text-xs text-muted">{row.slug}</p></div> },
              { key: "type", header: "Type", render: (row) => <Badge>{row.type}</Badge> },
              { key: "area", header: "Research Area", render: (row) => row.researchArea || "-" },
              { key: "year", header: "Year", render: (row) => row.year },
              { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
              { key: "featured", header: "Featured", render: (row) => (row.featured ? "Yes" : "No") },
              { key: "updated", header: "Updated", render: (row) => format(new Date(row.updatedAt), "MMM d, yyyy") },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setState(toEditorState(row))}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`/research/${row.slug}`, "_blank")}>Preview</Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        startTransition(async () => {
                          await deleteResearchAction(row.id);
                          toast.success("Entry deleted");
                        })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{state.id ? "Edit Research" : "Create Research"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "editor" | "preview")}> 
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="space-y-4 pt-4">
              <div className="grid gap-2 md:grid-cols-3">
                <Input placeholder="Title" value={state.title} onChange={(event) => setField("title", event.target.value)} />
                <Input placeholder="Slug" value={state.slug} onChange={(event) => setField("slug", event.target.value)} />
                <Input placeholder="Year" value={state.year} onChange={(event) => setField("year", event.target.value)} />
                <Input className="md:col-span-3" placeholder="Summary" value={state.summary} onChange={(event) => setField("summary", event.target.value)} />
              </div>

              <div className="grid gap-2 md:grid-cols-4">
                <select className="rounded-xl border border-border bg-surface p-2.5" value={state.type} onChange={(event) => onTypeChange(event.target.value as ResearchType)}>
                  {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <select className="rounded-xl border border-border bg-surface p-2.5" value={state.status} onChange={(event) => setField("status", event.target.value as EditorState["status"])}>
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <Input placeholder="Research Area" value={state.researchArea} onChange={(event) => setField("researchArea", event.target.value)} />
                <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3"><input type="checkbox" checked={state.featured} onChange={(event) => setField("featured", event.target.checked)} />Featured</label>
                <Input placeholder="Category" value={state.category} onChange={(event) => setField("category", event.target.value)} />
                <Input placeholder="Tags (comma separated)" value={state.tags} onChange={(event) => setField("tags", event.target.value)} className="md:col-span-3" />
                <Input placeholder="Authors (comma separated)" value={state.authors} onChange={(event) => setField("authors", event.target.value)} className="md:col-span-2" />
                <Input placeholder="Affiliation" value={state.affiliation} onChange={(event) => setField("affiliation", event.target.value)} className="md:col-span-2" />
                <Input placeholder="Dataset" value={state.dataset} onChange={(event) => setField("dataset", event.target.value)} />
                <Input placeholder="Duration" value={state.duration} onChange={(event) => setField("duration", event.target.value)} />
                <Input placeholder="Cover Image URL" value={state.coverImage} onChange={(event) => setField("coverImage", event.target.value)} className="md:col-span-2" />
                <Input placeholder="Code URL" value={state.codeUrl} onChange={(event) => setField("codeUrl", event.target.value)} />
                <Input placeholder="PDF URL" value={state.pdfUrl} onChange={(event) => setField("pdfUrl", event.target.value)} />
                <Input placeholder="Demo URL" value={state.demoUrl} onChange={(event) => setField("demoUrl", event.target.value)} />
                <Input placeholder="Notes URL" value={state.notesUrl} onChange={(event) => setField("notesUrl", event.target.value)} />
                <Textarea placeholder="Citation" value={state.citation} onChange={(event) => setField("citation", event.target.value)} className="md:col-span-4" />
                <Textarea placeholder="References JSON" value={state.referencesJson} onChange={(event) => setField("referencesJson", event.target.value)} className="md:col-span-4 min-h-[120px]" />
                <div className="md:col-span-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">Related Research</p>
                  <div className="flex flex-wrap gap-2">
                    {allSlugs.map((slug) => {
                      const selected = state.relatedSlugs.split(",").map((part) => part.trim()).includes(slug);
                      return (
                        <label key={slug} className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-2 py-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => {
                              const current = state.relatedSlugs.split(",").map((part) => part.trim()).filter(Boolean);
                              const next = event.target.checked ? [...current, slug] : current.filter((item) => item !== slug);
                              setField("relatedSlugs", next.join(", "));
                            }}
                          />
                          {slug}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <Input placeholder="SEO Title" value={state.seoTitle} onChange={(event) => setField("seoTitle", event.target.value)} className="md:col-span-2" />
                <Input placeholder="SEO Description" value={state.seoDescription} onChange={(event) => setField("seoDescription", event.target.value)} className="md:col-span-2" />
                <Input type="datetime-local" placeholder="Published At" value={state.publishedAt} onChange={(event) => setField("publishedAt", event.target.value)} className="md:col-span-2" />
              </div>

              <div className="space-y-3 rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Structured Content ({state.type})</p>
                {TYPE_FIELDS[state.type].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <p className="text-sm font-medium">{field.label}</p>
                    <Textarea
                      value={state.content[field.key] ?? ""}
                      onChange={(event) =>
                        setState((current) => ({
                          ...current,
                          content: { ...current.content, [field.key]: event.target.value },
                        }))
                      }
                      className="min-h-[90px]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onSubmit} disabled={pending}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setState(createDefaultState())}>New</Button>
                <Button type="button" variant="outline" onClick={() => setActiveTab("preview")}>Preview Draft</Button>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="space-y-4 pt-4">
              <div className="rounded-xl border border-border/60 p-4">
                <h3 className="text-2xl font-semibold tracking-tight">{preview.title || "Untitled Draft"}</h3>
                <p className="mt-2 text-sm text-muted">{preview.summary || "Summary pending."}</p>
                <p className="mt-1 text-xs text-muted">{preview.authors.join(", ") || "Author pending"}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <ResearchDetailRenderer type={preview.type} content={preview.content} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
