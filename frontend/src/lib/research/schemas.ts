import { z } from "zod";

import { optionalUrlSchema } from "@/lib/validators/common";
import { RESEARCH_STATUS, RESEARCH_TYPES } from "@/lib/research/types";

const paragraph = z.string().trim().min(1, "This field is required.");

export const experimentContentSchema = z.object({
  objective: paragraph,
  dataset: paragraph,
  method: paragraph,
  metrics: paragraph,
  results: paragraph,
  keyInsight: paragraph,
  limitations: paragraph,
  nextSteps: paragraph,
});

export const paperContentSchema = z.object({
  abstract: paragraph,
  introduction: paragraph,
  problemStatement: paragraph,
  relatedWork: paragraph,
  methodology: paragraph,
  systemArchitecture: paragraph,
  experiments: paragraph,
  results: paragraph,
  discussion: paragraph,
  conclusion: paragraph,
  futureWork: paragraph,
});

export const systemContentSchema = z.object({
  overview: paragraph,
  problem: paragraph,
  systemDiagram: z.string().trim(),
  components: paragraph,
  dataFlow: paragraph,
  architectureDecisions: paragraph,
  techStack: paragraph,
  evaluation: paragraph,
  conclusion: paragraph,
});

export const thesisContentSchema = z.object({
  abstract: paragraph,
  context: paragraph,
  researchQuestion: paragraph,
  literatureReview: paragraph,
  methodology: paragraph,
  implementation: paragraph,
  findings: paragraph,
  discussion: paragraph,
  conclusion: paragraph,
  limitations: paragraph,
  futureWork: paragraph,
  appendix: paragraph,
});

export const noteContentSchema = z.object({
  overview: paragraph,
  keyIdea: paragraph,
  explanation: paragraph,
  implications: paragraph,
  references: paragraph,
});

export const researchTypeSchema = z.enum(RESEARCH_TYPES);
export const researchStatusSchema = z.enum(RESEARCH_STATUS);

export const referencesSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1),
      url: optionalUrlSchema.optional(),
      authors: z.array(z.string().trim().min(1)).default([]),
      year: z.number().int().min(1900).max(2100).optional(),
    }),
  )
  .default([]);

export const researchBaseSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(2),
  title: z.string().trim().min(3),
  summary: z.string().trim().min(20),
  type: researchTypeSchema,
  category: z.string().trim().optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1)).default([]),
  year: z.coerce.number().int().min(2000).max(2100),
  status: researchStatusSchema.default("DRAFT"),
  featured: z.boolean().default(false),
  authors: z.array(z.string().trim().min(1)).min(1),
  affiliation: z.string().trim().optional().or(z.literal("")),
  researchArea: z.string().trim().optional().or(z.literal("")),
  progressPercent: z
    .preprocess(
      (value) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === "string" && value.trim() === "") return undefined;
        return value;
      },
      z.coerce.number().int().min(0).max(100),
    )
    .optional(),
  dataset: z.string().trim().optional().or(z.literal("")),
  duration: z.string().trim().optional().or(z.literal("")),
  pdfUrl: optionalUrlSchema,
  codeUrl: optionalUrlSchema,
  demoUrl: optionalUrlSchema,
  notesUrl: optionalUrlSchema,
  coverImage: optionalUrlSchema,
  citation: z.string().trim().optional().or(z.literal("")),
  references: referencesSchema,
  relatedSlugs: z.array(z.string().trim().min(1)).default([]),
  seoTitle: z.string().trim().optional().or(z.literal("")),
  seoDescription: z.string().trim().optional().or(z.literal("")),
  publishedAt: z.string().datetime().optional().or(z.literal("")),
});

export const researchByTypeSchema = {
  EXPERIMENT: experimentContentSchema,
  PAPER: paperContentSchema,
  SYSTEM: systemContentSchema,
  THESIS: thesisContentSchema,
  NOTE: noteContentSchema,
} as const;

export const researchFormSchema = z.discriminatedUnion("type", [
  researchBaseSchema.extend({ type: z.literal("EXPERIMENT"), content: experimentContentSchema }),
  researchBaseSchema.extend({ type: z.literal("PAPER"), content: paperContentSchema }),
  researchBaseSchema.extend({ type: z.literal("SYSTEM"), content: systemContentSchema }),
  researchBaseSchema.extend({ type: z.literal("THESIS"), content: thesisContentSchema }),
  researchBaseSchema.extend({ type: z.literal("NOTE"), content: noteContentSchema }),
]);
