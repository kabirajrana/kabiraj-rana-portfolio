import { z } from "zod";

import { optionalUrlSchema, publishStatusSchema, stringArraySchema } from "@/lib/validators/common";

export const projectSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(2),
  slug: z.string().min(2),
  summary: z.string().min(10),
  description: z.string().min(10),
  year: z.string().optional(),
  category: z.string().min(2),
  tags: stringArraySchema,
  techStack: stringArraySchema,
  githubUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  featured: z.boolean().default(false),
  status: publishStatusSchema.default("DRAFT"),
  highlights: stringArraySchema,
  screenshots: stringArraySchema,
  coverImage: z.string().optional(),
  dataset: z.string().optional(),
  model: z.string().optional(),
  results: z.string().optional(),
  architectureDiagram: z.string().optional(),
  scheduledAt: z.string().optional().or(z.literal("")),
});

export const experienceSchema = z.object({
  id: z.string().cuid().optional(),
  timeframe: z.string().optional(),
  role: z.string().min(2),
  org: z.string().min(2),
  summary: z.string().optional(),
  location: z.string().min(2),
  sidePlacement: z.enum(["AUTO", "LEFT", "RIGHT"]).default("AUTO"),
  startDate: z.string().date(),
  endDate: z.string().date().optional().or(z.literal("")),
  currentRole: z.boolean().default(false),
  achievements: stringArraySchema,
  techStack: stringArraySchema,
  status: publishStatusSchema.default("DRAFT"),
  scheduledAt: z.string().optional().or(z.literal("")),
});

export const researchSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(2),
  slug: z.string().min(2),
  year: z.string().optional(),
  abstract: z.string().min(10),
  category: z.enum(["EXPERIMENTS", "MODEL_ARCHITECTURE", "DATASET_STUDIES", "SYSTEM_DESIGN", "NOTES"]),
  problemStatement: z.string().optional(),
  evaluationMetrics: z.string().optional(),
  tags: stringArraySchema,
  content: z.string().min(10),
  datasetUsed: z.string().optional(),
  methods: stringArraySchema,
  models: stringArraySchema,
  resultsSummary: z.string().optional(),
  references: stringArraySchema,
  githubRepoUrl: optionalUrlSchema,
  featured: z.boolean().default(false),
  status: publishStatusSchema.default("DRAFT"),
  scheduledAt: z.string().optional().or(z.literal("")),
});

export const messageSchema = z.object({
  sender: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  body: z.string().min(10),
});

export const projectCategorySchema = z.object({
  id: z.string().cuid().optional(),
  label: z.string().min(2),
  slug: z.string().min(2),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const projectsPageConfigSchema = z.object({
  smallLabel: z.string().min(2),
  title: z.string().min(2),
  subtitle: z.string().min(10),
});

export const certificationSchema = z.object({
  id: z.string().cuid().optional(),
  codeLabel: z.string().min(1),
  title: z.string().min(2),
  credentialUrl: optionalUrlSchema,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const experiencePageConfigSchema = z.object({
  smallLabel: z.string().min(2),
  title: z.string().min(2),
  subtitle: z.string().min(10),
  showTimeline: z.boolean().default(true),
  showCertifications: z.boolean().default(true),
  certTitle: z.string().min(2),
  certSubtitle: z.string().min(10),
});

export const researchPageConfigSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().min(10),
  description: z.string().min(10),
  heroChips: stringArraySchema,
});

export const researchFilterTabSchema = z.object({
  id: z.string().cuid().optional(),
  label: z.string().min(2),
  value: z.string().min(2),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const contactPageConfigSchema = z.object({
  email: z.string().email(),
  locationText: z.string().min(2),
  responseTime: z.string().min(2),
  availabilityEnabled: z.boolean().default(true),
  availabilityHeadline: z.string().min(2),
  availabilitySubtext: z.string().min(2),
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  additionalLinks: z.string().optional(),
});
