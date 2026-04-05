import { normalizeResearchContent } from "@/lib/research/validators";
import type { PublicResearchEntry } from "@/types/research";

type RawResearch = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: unknown;
  type: "EXPERIMENT" | "PAPER" | "SYSTEM" | "THESIS" | "NOTE";
  category: string | null;
  tags: string[];
  year: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  authors: string[];
  affiliation: string | null;
  researchArea: string | null;
  progressPercent: number | null;
  dataset: string | null;
  duration: string | null;
  pdfUrl: string | null;
  codeUrl: string | null;
  demoUrl: string | null;
  notesUrl: string | null;
  coverImage: string | null;
  citation: string | null;
  references: unknown;
  relatedSlugs: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapResearchEntry(row: RawResearch): PublicResearchEntry {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: normalizeResearchContent(row.type, row.content),
    type: row.type,
    category: row.category,
    tags: row.tags,
    year: row.year,
    status: row.status,
    featured: row.featured,
    authors: row.authors,
    affiliation: row.affiliation,
    researchArea: row.researchArea,
    progressPercent: row.progressPercent,
    dataset: row.dataset,
    duration: row.duration,
    pdfUrl: row.pdfUrl,
    codeUrl: row.codeUrl,
    demoUrl: row.demoUrl,
    notesUrl: row.notesUrl,
    coverImage: row.coverImage,
    citation: row.citation,
    references: row.references,
    relatedSlugs: row.relatedSlugs,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
