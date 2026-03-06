import { z } from "zod";

export const siteSettingsSchema = z.object({
  siteName: z.string().min(2),
  primaryEmail: z.string().email(),
  locationText: z.string().min(2),
  responseTimeText: z.string().min(2),
  availabilityEnabled: z.boolean().default(true),
  availabilityHeadline: z.string().min(2),
  availabilitySubtext: z.string().min(2),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  xUrl: z.string().url().optional().or(z.literal("")),
  accentColor: z.string().min(2),
  glowIntensity: z.coerce.number().min(0).max(2),
  borderRadiusScale: z.coerce.number().min(0.6).max(2),
  enableProjects: z.boolean().default(true),
  enableResearch: z.boolean().default(true),
  enableGitHub: z.boolean().default(true),
  enableExperience: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
