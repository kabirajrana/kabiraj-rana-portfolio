import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ResearchDetailRenderer, getTocByType } from "@/components/research/research-detail-renderer";
import { ResearchMetadataRail } from "@/components/research/research-metadata-rail";
import { ResearchToc } from "@/components/research/research-toc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contentRepository } from "@/lib/db/repositories";
import { mapResearchEntry } from "@/lib/research/mappers";
import { getTypeLabel } from "@/lib/research/types";
import { buildMetadata } from "@/lib/seo";
import type { PublicResearchEntry } from "@/types/research";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await contentRepository.getResearchBySlug(slug);
  if (!item) {
    return buildMetadata({ title: "Research Not Found", description: "The requested research publication does not exist.", path: `/research/${slug}` });
  }

  const abstract = typeof (item as Record<string, unknown>).abstract === "string" ? ((item as Record<string, unknown>).abstract as string) : "";

  return buildMetadata({
    title: (item.seoTitle as string | undefined) || item.title,
    description: (item.seoDescription as string | undefined) || (item.summary as string | undefined) || abstract || "",
    path: `/research/${item.slug}`,
  });
}

export default async function ResearchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await contentRepository.getResearchBySlug(slug);

  if (!item || item.status !== "PUBLISHED") {
    notFound();
  }

  const entry = mapResearchEntry(item as never);

  const [related, adjacent] = await Promise.all([
    contentRepository.listRelatedResearch(entry.relatedSlugs, entry.id),
    contentRepository.getAdjacentResearch({ id: entry.id, year: entry.year, publishedAt: item.publishedAt, status: "PUBLISHED" }),
  ]);

  const relatedEntries = related.map((row: (typeof related)[number]) => mapResearchEntry(row as never));
  const [previousRaw, nextRaw] = adjacent;
  const previous = previousRaw ? mapResearchEntry(previousRaw as never) : null;
  const next = nextRaw ? mapResearchEntry(nextRaw as never) : null;
  const toc = getTocByType(entry.type);

  return (
    <Container className="py-14 md:py-20">
      <article className="space-y-8">
        <header className="space-y-4 border-b border-border/60 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{getTypeLabel(entry.type)}</Badge>
            <Badge>{entry.status}</Badge>
            <Badge>{entry.year}</Badge>
            {entry.researchArea ? <Badge>{entry.researchArea}</Badge> : null}
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">{entry.title}</h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted md:text-lg">{entry.summary}</p>
          <p className="text-sm text-muted">
            {entry.authors.join(", ") || "Kabiraj Rana"}
            {entry.affiliation ? ` • ${entry.affiliation}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {entry.pdfUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={entry.pdfUrl} target="_blank" rel="noreferrer">PDF</a>
              </Button>
            ) : null}
            {entry.codeUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={entry.codeUrl} target="_blank" rel="noreferrer">Code</a>
              </Button>
            ) : null}
            {entry.demoUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={entry.demoUrl} target="_blank" rel="noreferrer">Demo</a>
              </Button>
            ) : null}
            {entry.notesUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={entry.notesUrl} target="_blank" rel="noreferrer">Notes</a>
              </Button>
            ) : null}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
          <ResearchMetadataRail entry={entry} />

          <div className={`min-w-0 ${entry.type === "PAPER" || entry.type === "THESIS" ? "mx-auto w-full max-w-3xl" : ""}`}>
            <ResearchDetailRenderer type={entry.type} content={entry.content} />

            {Array.isArray(entry.references) && entry.references.length ? (
              <section className="mt-10 space-y-4 border-t border-border/40 pt-8">
                <h2 className="text-2xl font-semibold tracking-tight">References</h2>
                <div className="space-y-2 text-sm text-muted">
                  {(entry.references as Array<{ title?: string; url?: string }>).map((ref, index) => (
                    <p key={`${entry.id}-ref-${index}`}>
                      {ref.url ? (
                        <a href={ref.url} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
                          {ref.title || ref.url}
                        </a>
                      ) : (
                        ref.title || "Untitled reference"
                      )}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            {relatedEntries.length ? (
              <section className="mt-10 space-y-4 border-t border-border/40 pt-8">
                <h2 className="text-2xl font-semibold tracking-tight">Related Research</h2>
                <div className="space-y-3">
                  {relatedEntries.map((relatedItem: PublicResearchEntry) => (
                    <Link
                      key={relatedItem.id}
                      href={`/research/${relatedItem.slug}`}
                      className="block rounded-xl border border-border/50 p-4 transition-colors hover:border-accent/40"
                    >
                      <p className="font-medium">{relatedItem.title}</p>
                      <p className="mt-1 text-sm text-muted">{relatedItem.summary}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {previous || next ? (
              <section className="mt-10 grid gap-3 border-t border-border/40 pt-8 md:grid-cols-2">
                {previous ? (
                  <Link href={`/research/${previous.slug}`} className="rounded-xl border border-border/50 p-4 hover:border-accent/40">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Previous</p>
                    <p className="mt-1 font-medium">{previous.title}</p>
                  </Link>
                ) : <div />}
                {next ? (
                  <Link href={`/research/${next.slug}`} className="rounded-xl border border-border/50 p-4 hover:border-accent/40">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Next</p>
                    <p className="mt-1 font-medium">{next.title}</p>
                  </Link>
                ) : null}
              </section>
            ) : null}
          </div>

          <ResearchToc items={toc} />
        </div>
      </article>
    </Container>
  );
}
