"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import TurndownService from "turndown";

import { validateCsrfToken } from "@/lib/auth/csrf";
import { requireAdminSession } from "@/lib/auth/guards";
import { comparePassword } from "@/lib/auth/password";
import { signAdminSession } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/admin/audit";
import { runHealthCheckReport } from "@/lib/admin/health";
import { createContentRevision, listContentRevisions, restoreContentRevision } from "@/lib/admin/revisions";
import { searchAdmin } from "@/lib/admin/search";
import { siteSettingsSchema } from "@/lib/admin/settings";
import { clearPreviewCookie, createPreviewToken, setPreviewCookie } from "@/lib/admin/preview";
import { trackEvent } from "@/lib/analytics/events";
import { createAuditLog } from "@/lib/db/audit-log";
import { contentRepository } from "@/lib/db/repositories";
import { serverEnv } from "@/lib/env.server";
import { checkRateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validators/auth";
import {
  certificationSchema,
  contactPageConfigSchema,
  experiencePageConfigSchema,
  experienceSchema,
  messageSchema,
  projectCategorySchema,
  projectSchema,
  projectsPageConfigSchema,
  researchFilterTabSchema,
  researchPageConfigSchema,
} from "@/lib/validators/content";
import { researchFormSchema, researchTypeSchema } from "@/lib/research/schemas";
import { safeValidateResearchContentByType } from "@/lib/research/validators";
import { slugify } from "@/lib/utils";

type PublishStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
type MessageStatus = "UNREAD" | "READ" | "ARCHIVED" | "DELETED";

function parseList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseText(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim();
}

function parseScheduledAt(raw: FormDataEntryValue | null): Date | null {
  const value = String(raw ?? "").trim();
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function looksLikeBcryptHash(value: unknown): value is string {
  return typeof value === "string" && /^\$2[abxy]\$\d{2}\$/.test(value);
}

function normalizeAdminNextPath(raw: FormDataEntryValue | null): string {
  const value = String(raw ?? "").trim();
  if (!value || !value.startsWith("/")) {
    return "/admin/dashboard";
  }

  if (value.startsWith("//") || value.startsWith("/\\")) {
    return "/admin/dashboard";
  }

  return value.startsWith("/admin") ? value : "/admin/dashboard";
}

async function ensureUniqueSlug(baseSlug: string, entity: "project" | "research", id?: string) {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing =
      entity === "project"
        ? await contentRepository.findProjectBySlug(candidate)
        : await contentRepository.findResearchBySlug(candidate);

    if (!existing || existing.id === id) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

export async function adminLoginAction(formData: FormData) {
  const nextPath = normalizeAdminNextPath(formData.get("next"));
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    csrfToken: formData.get("csrfToken"),
  });

  if (!parsed.success) {
    console.warn("[admin-auth] Invalid login payload", {
      issues: parsed.error.issues.length,
    });
    return { success: false, message: "Invalid login payload." };
  }

  const forwardedFor = (await headers()).get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`login:${forwardedFor}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return { success: false, message: `Too many attempts. Retry in ${limit.retryAfterSeconds}s.` };
  }

  const csrfValid = await validateCsrfToken(parsed.data.csrfToken);
  if (!csrfValid) {
    console.warn("[admin-auth] CSRF validation failed", {
      email: parsed.data.email,
    });
    return { success: false, message: "CSRF validation failed." };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  let user: Record<string, any> | null = null;
  try {
    user = await contentRepository.getAdminUserByEmail(normalizedEmail);
  } catch (error) {
    console.error("[admin-auth] Failed to fetch admin user from backend API", {
      email: normalizedEmail,
      message: error instanceof Error ? error.message : "unknown",
    });
    return { success: false, message: "Authentication service unavailable. Check backend URL/env configuration." };
  }

  if (!user) {
    console.warn("[admin-auth] Admin user not found", {
      email: normalizedEmail,
    });
    return { success: false, message: "Invalid credentials." };
  }

  const seedEmail = serverEnv.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const seedPassword = serverEnv.ADMIN_SEED_PASSWORD ?? "";
  const validSeedCredential = Boolean(seedEmail && seedPassword && normalizedEmail === seedEmail && parsed.data.password === seedPassword);

  let validPassword = false;
  if (looksLikeBcryptHash(user.passwordHash)) {
    validPassword = await comparePassword(parsed.data.password, user.passwordHash);
  }

  if (!validPassword && validSeedCredential) {
    validPassword = true;
  }

  if (!validPassword || user.role !== "ADMIN") {
    console.warn("[admin-auth] Credential verification failed", {
      email: normalizedEmail,
      hasBcrypt: looksLikeBcryptHash(user.passwordHash),
      role: user.role,
    });
    return { success: false, message: "Invalid credentials." };
  }

  const token = await signAdminSession({
    userId: user.id,
    email: user.email,
    role: "ADMIN",
    name: user.name,
  });

  (await cookies()).set(serverEnv.ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: serverEnv.ADMIN_SESSION_TTL_SECONDS,
  });

  await contentRepository.updateAdminLastLogin(String(user.id));

  await createAuditLog({ actorId: user.id, action: "LOGIN", resource: "AdminUser", resourceId: user.id });

  console.info("[admin-auth] Login success", {
    userId: user.id,
    email: user.email,
    nextPath,
  });

  return { success: true, message: "Logged in", redirectTo: nextPath };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();

  cookieStore.set(serverEnv.ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  try {
    const session = await requireAdminSession();
    await createAuditLog({ actorId: session.userId, action: "LOGOUT", resource: "AdminUser", resourceId: session.userId });
  } catch {
    // Session is already missing/invalid; cookie has already been cleared.
  }

  redirect("/admin/login");
}

export async function saveHomeAction(formData: FormData) {
  const session = await requireAdminSession();

  const payload = {
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroSubtitle: String(formData.get("heroSubtitle") ?? ""),
    heroTagline: String(formData.get("heroTagline") ?? ""),
    ctas: parseList(formData.get("ctas")),
    featuredProjectIds: parseList(formData.get("featuredProjectIds")),
    techHighlights: parseList(formData.get("techHighlights")),
    toggles: {
      showProjects: formData.get("showProjects") === "on",
      showResearch: formData.get("showResearch") === "on",
      showExperience: formData.get("showExperience") === "on",
    },
  };

  const status = (String(formData.get("status") ?? "DRAFT") as PublishStatus) ?? "DRAFT";
  const scheduledAt = parseScheduledAt(formData.get("scheduledAt"));

  const content = await contentRepository.upsertHomeContent(payload, status, session.userId, scheduledAt);
  await createContentRevision({
    entityType: "SiteContent",
    entityId: content.id,
    action: status === "PUBLISHED" ? "PUBLISH" : status === "SCHEDULED" ? "SCHEDULE" : "UPDATE",
    actorAdminId: session.userId,
    snapshot: content,
  });
  await logAdminAction({
    actorAdminId: session.userId,
    action: status === "PUBLISHED" ? "PUBLISH" : status === "SCHEDULED" ? "SCHEDULE" : "UPDATE",
    entityType: "SiteContent",
    entityId: content.id,
    summary: `Updated home content as ${status}`,
  });
  revalidatePath("/admin/home");
  revalidatePath("/");
}

export async function saveAboutAction(formData: FormData) {
  const session = await requireAdminSession();
  const payload = {
    bio: String(formData.get("bio") ?? ""),
    education: String(formData.get("education") ?? ""),
    focusAreas: String(formData.get("focusAreas") ?? ""),
    timelineNotes: String(formData.get("timelineNotes") ?? ""),
  };

  const status = (String(formData.get("status") ?? "DRAFT") as PublishStatus) ?? "DRAFT";
  const scheduledAt = parseScheduledAt(formData.get("scheduledAt"));

  const content = await contentRepository.upsertAboutContent(payload, status, session.userId, scheduledAt);
  await createContentRevision({
    entityType: "SiteContent",
    entityId: content.id,
    action: status === "PUBLISHED" ? "PUBLISH" : status === "SCHEDULED" ? "SCHEDULE" : "UPDATE",
    actorAdminId: session.userId,
    snapshot: content,
  });
  await logAdminAction({
    actorAdminId: session.userId,
    action: status === "PUBLISHED" ? "PUBLISH" : status === "SCHEDULED" ? "SCHEDULE" : "UPDATE",
    entityType: "SiteContent",
    entityId: content.id,
    summary: `Updated about content as ${status}`,
  });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

export async function upsertProjectAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "") || undefined;
  const title = String(formData.get("title") ?? "");
  const slugBase = slugify(String(formData.get("slug") ?? title));

  const payload = projectSchema.parse({
    id,
    title,
    slug: await ensureUniqueSlug(slugBase, "project", id),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    year: String(formData.get("year") ?? ""),
    category: parseText(formData.get("category")) || "AI/ML",
    tags: parseList(formData.get("tags")),
    techStack: parseList(formData.get("techStack")),
    githubUrl: String(formData.get("githubUrl") ?? ""),
    liveUrl: String(formData.get("liveUrl") ?? ""),
    featured: formData.get("featured") === "on",
    status: String(formData.get("status") ?? "DRAFT"),
    highlights: parseList(formData.get("highlights")),
    screenshots: parseList(formData.get("screenshots")),
    coverImage: String(formData.get("coverImage") ?? ""),
    dataset: String(formData.get("dataset") ?? ""),
    model: String(formData.get("model") ?? ""),
    results: String(formData.get("results") ?? ""),
    architectureDiagram: String(formData.get("architectureDiagram") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
  });

  const scheduledAt = payload.status === "SCHEDULED" ? parseScheduledAt(payload.scheduledAt ?? "") : null;

  const item = await contentRepository.upsertProject({
    ...payload,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    publishedAt: payload.status === "PUBLISHED" ? new Date() : null,
    scheduledAt,
  });

  await createContentRevision({
    entityType: "Project",
    entityId: item.id,
    action: payload.status === "PUBLISHED" ? "PUBLISH" : payload.status === "SCHEDULED" ? "SCHEDULE" : id ? "UPDATE" : "CREATE",
    actorAdminId: session.userId,
    snapshot: item,
  });

  await createAuditLog({ actorId: session.userId, action: "UPSERT", resource: "Project", resourceId: item.id });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function deleteProjectAction(id: string) {
  const session = await requireAdminSession();
  await contentRepository.deleteProject(id);
  await createAuditLog({ actorId: session.userId, action: "DELETE", resource: "Project", resourceId: id });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function reorderProjectsAction(ids: string[]) {
  const session = await requireAdminSession();

  await contentRepository.reorderProjects(ids);
  await createAuditLog({ actorId: session.userId, action: "REORDER", resource: "Project" });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function upsertProjectsPageConfigAction(formData: FormData) {
  const session = await requireAdminSession();
  const payload = projectsPageConfigSchema.parse({
    smallLabel: String(formData.get("smallLabel") ?? "PROJECTS"),
    title: String(formData.get("title") ?? "All projects."),
    subtitle: String(formData.get("subtitle") ?? ""),
  });

  await contentRepository.upsertProjectsPageConfig({ id: "default-projects", ...payload });
  await createAuditLog({ actorId: session.userId, action: "UPDATE", resource: "ProjectsPageConfig", resourceId: "default-projects" });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function upsertProjectCategoryAction(formData: FormData) {
  const session = await requireAdminSession();
  const label = String(formData.get("label") ?? "");
  const payload = projectCategorySchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    label,
    slug: slugify(String(formData.get("slug") ?? label)),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isVisible: formData.get("isVisible") === "on",
  });

  const item = await contentRepository.upsertProjectCategory(payload);
  await createAuditLog({ actorId: session.userId, action: "UPSERT", resource: "ProjectCategory", resourceId: item.id });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function deleteProjectCategoryAction(id: string) {
  const session = await requireAdminSession();
  await contentRepository.deleteProjectCategory(id);
  await createAuditLog({ actorId: session.userId, action: "DELETE", resource: "ProjectCategory", resourceId: id });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function reorderProjectCategoriesAction(ids: string[]) {
  const session = await requireAdminSession();
  await contentRepository.reorderProjectCategories(ids);
  await createAuditLog({ actorId: session.userId, action: "REORDER", resource: "ProjectCategory" });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function upsertExperienceAction(formData: FormData) {
  const session = await requireAdminSession();

  const id = String(formData.get("id") ?? "") || undefined;

  const payload = experienceSchema.parse({
    id,
    timeframe: String(formData.get("timeframe") ?? ""),
    role: String(formData.get("role") ?? ""),
    org: String(formData.get("org") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    location: String(formData.get("location") ?? ""),
    sidePlacement: String(formData.get("sidePlacement") ?? "AUTO"),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    currentRole: formData.get("currentRole") === "on",
    achievements: parseList(formData.get("achievements")),
    techStack: parseList(formData.get("techStack")),
    status: String(formData.get("status") ?? "DRAFT"),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
  });

  const scheduledAt = payload.status === "SCHEDULED" ? parseScheduledAt(payload.scheduledAt ?? "") : null;

  const item = await contentRepository.upsertExperience({
    ...payload,
    startDate: new Date(payload.startDate),
    endDate: payload.endDate ? new Date(payload.endDate) : null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    scheduledAt,
  });

  await createContentRevision({
    entityType: "Experience",
    entityId: item.id,
    action: payload.status === "PUBLISHED" ? "PUBLISH" : payload.status === "SCHEDULED" ? "SCHEDULE" : id ? "UPDATE" : "CREATE",
    actorAdminId: session.userId,
    snapshot: item,
  });

  await createAuditLog({ actorId: session.userId, action: "UPSERT", resource: "Experience", resourceId: item.id });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
}

export async function deleteExperienceAction(id: string) {
  const session = await requireAdminSession();
  const result = await contentRepository.deleteExperience(id);
  if (result.count > 0) {
    await createAuditLog({ actorId: session.userId, action: "DELETE", resource: "Experience", resourceId: id });
  }
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
}

export async function upsertExperiencePageConfigAction(formData: FormData) {
  const session = await requireAdminSession();
  const payload = experiencePageConfigSchema.parse({
    smallLabel: String(formData.get("smallLabel") ?? "EXPERIENCE"),
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    showTimeline: formData.get("showTimeline") === "on",
    showCertifications: formData.get("showCertifications") === "on",
    certTitle: String(formData.get("certTitle") ?? ""),
    certSubtitle: String(formData.get("certSubtitle") ?? ""),
  });
  await contentRepository.upsertExperiencePageConfig({ id: "default-experience", ...payload });
  await createAuditLog({ actorId: session.userId, action: "UPDATE", resource: "ExperiencePageConfig", resourceId: "default-experience" });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
}

export async function upsertCertificationAction(formData: FormData) {
  const session = await requireAdminSession();
  const payload = certificationSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    codeLabel: String(formData.get("codeLabel") ?? ""),
    title: String(formData.get("title") ?? ""),
    credentialUrl: parseText(formData.get("credentialUrl")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isVisible: formData.get("isVisible") === "on",
  });
  const item = await contentRepository.upsertCertification(payload);
  await createAuditLog({ actorId: session.userId, action: "UPSERT", resource: "Certification", resourceId: item.id });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
}

export async function deleteCertificationAction(id: string) {
  const session = await requireAdminSession();
  const result = await contentRepository.deleteCertification(id);
  if (result.count > 0) {
    await createAuditLog({ actorId: session.userId, action: "DELETE", resource: "Certification", resourceId: id });
  }
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
}

export async function upsertResearchAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "") || undefined;
  const title = String(formData.get("title") ?? "");
  const slugBase = slugify(String(formData.get("slug") ?? title));

  const type = String(formData.get("type") ?? "NOTE");
  const contentRaw = String(formData.get("contentJson") ?? "{}");
  const referencesRaw = String(formData.get("referencesJson") ?? "[]");
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  const validatedType = researchTypeSchema.parse(type);

  let parsedContent: unknown;
  let parsedReferences: unknown;
  try {
    parsedContent = JSON.parse(contentRaw || "{}");
    parsedReferences = JSON.parse(referencesRaw || "[]");
  } catch {
    throw new Error("Invalid JSON payload for content/references.");
  }

  const contentValidation = safeValidateResearchContentByType(validatedType, parsedContent);
  if (!contentValidation.success) {
    throw new Error("Research content is invalid for selected type.");
  }

  const payload = researchFormSchema.parse({
    id,
    title,
    slug: await ensureUniqueSlug(slugBase, "research", id),
    summary: String(formData.get("summary") ?? ""),
    type: validatedType,
    category: String(formData.get("category") ?? ""),
    tags: parseList(formData.get("tags")),
    year: Number(formData.get("year") ?? new Date().getFullYear()),
    content: contentValidation.data,
    authors: parseList(formData.get("authors")),
    affiliation: String(formData.get("affiliation") ?? ""),
    researchArea: String(formData.get("researchArea") ?? ""),
    dataset: String(formData.get("dataset") ?? ""),
    duration: String(formData.get("duration") ?? ""),
    pdfUrl: String(formData.get("pdfUrl") ?? ""),
    codeUrl: String(formData.get("codeUrl") ?? ""),
    demoUrl: String(formData.get("demoUrl") ?? ""),
    notesUrl: String(formData.get("notesUrl") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    citation: String(formData.get("citation") ?? ""),
    references: Array.isArray(parsedReferences) ? parsedReferences : [],
    relatedSlugs: parseList(formData.get("relatedSlugs")),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    featured: formData.get("featured") === "on",
    status: String(formData.get("status") ?? "DRAFT"),
    publishedAt: publishedAtRaw,
  });

  const item = await contentRepository.upsertResearch({
    ...payload,
    category: payload.category || null,
    affiliation: payload.affiliation || null,
    researchArea: payload.researchArea || null,
    dataset: payload.dataset || null,
    duration: payload.duration || null,
    pdfUrl: payload.pdfUrl || null,
    codeUrl: payload.codeUrl || null,
    demoUrl: payload.demoUrl || null,
    notesUrl: payload.notesUrl || null,
    coverImage: payload.coverImage || null,
    citation: payload.citation || null,
    seoTitle: payload.seoTitle || null,
    seoDescription: payload.seoDescription || null,
    publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : payload.status === "PUBLISHED" ? new Date() : null,
  });

  await createContentRevision({
    entityType: "Research",
    entityId: item.id,
    action: payload.status === "PUBLISHED" ? "PUBLISH" : id ? "UPDATE" : "CREATE",
    actorAdminId: session.userId,
    snapshot: item,
  });

  await createAuditLog({ actorId: session.userId, action: "UPSERT", resource: "Research", resourceId: item.id });
  revalidatePath("/admin/research");
  revalidatePath("/research");
  revalidatePath(`/research/${item.slug}`);
}

export async function deleteResearchAction(id: string) {
  const session = await requireAdminSession();
  await contentRepository.deleteResearch(id);
  await createAuditLog({ actorId: session.userId, action: "DELETE", resource: "Research", resourceId: id });
  revalidatePath("/admin/research");
  revalidatePath("/research");
}

export async function upsertResearchPageConfigAction(formData: FormData) {
  const session = await requireAdminSession();
  const payload = researchPageConfigSchema.parse({
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    description: String(formData.get("description") ?? ""),
    heroChips: parseList(formData.get("heroChips")),
  });
  await contentRepository.upsertResearchPageConfig({ id: "default-research", ...payload });
  await createAuditLog({ actorId: session.userId, action: "UPDATE", resource: "ResearchPageConfig", resourceId: "default-research" });
  revalidatePath("/admin/research");
  revalidatePath("/research");
}

export async function upsertResearchFilterTabAction(formData: FormData) {
  const session = await requireAdminSession();
  const label = String(formData.get("label") ?? "");
  const payload = researchFilterTabSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    label,
    value: String(formData.get("value") ?? slugify(label).toUpperCase().replace(/-/g, "_")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isVisible: formData.get("isVisible") === "on",
  });
  const item = await contentRepository.upsertResearchFilterTab(payload);
  await createAuditLog({ actorId: session.userId, action: "UPSERT", resource: "ResearchFilterTab", resourceId: item.id });
  revalidatePath("/admin/research");
  revalidatePath("/research");
}

export async function deleteResearchFilterTabAction(id: string) {
  const session = await requireAdminSession();
  await contentRepository.deleteResearchFilterTab(id);
  await createAuditLog({ actorId: session.userId, action: "DELETE", resource: "ResearchFilterTab", resourceId: id });
  revalidatePath("/admin/research");
  revalidatePath("/research");
}

export async function exportResearchMarkdownAction(id: string) {
  await requireAdminSession();
  const article = await contentRepository.getResearchById(id);
  if (!article) return null;

  const turndown = new TurndownService();
  const abstract = typeof (article as Record<string, unknown>).abstract === "string" ? ((article as Record<string, unknown>).abstract as string) : "";
  const sections = Object.entries((article.content ?? {}) as Record<string, unknown>)
    .map(([key, value]) => `## ${key}\n\n${String(value ?? "")}`)
    .join("\n\n");
  const markdown = turndown.turndown(sections);
  return `# ${article.title}\n\n${article.summary ?? abstract}\n\n${markdown}`;
}

export async function updateGithubSettingsAction(formData: FormData) {
  const session = await requireAdminSession();

  await contentRepository.upsertGithubSettings({
    id: "default",
    githubUsername: String(formData.get("githubUsername") ?? ""),
    enableGitHubDashboard: formData.get("enableGitHubDashboard") === "on",
    cacheRevalidateSeconds: Number(formData.get("cacheRevalidateSeconds") ?? 900),
    hiddenRepos: parseList(formData.get("hiddenRepos")),
    pinnedOverrides: parseList(formData.get("pinnedOverrides")),
  });

  await createAuditLog({ actorId: session.userId, action: "UPDATE", resource: "GitHubSetting", resourceId: "default" });
  revalidatePath("/admin/github");
}

export async function syncGithubNowAction() {
  const session = await requireAdminSession();

  await contentRepository.upsertGithubSettings({
    id: "default",
    githubUsername: process.env.GITHUB_USERNAME ?? "",
    enableGitHubDashboard: true,
    cacheRevalidateSeconds: 900,
    hiddenRepos: [],
    pinnedOverrides: [],
    lastSyncAt: new Date(),
    lastError: null,
  });

  await createAuditLog({ actorId: session.userId, action: "SYNC", resource: "GitHubSetting", resourceId: "default" });
  revalidatePath("/admin/github");
}

export async function updateMessageStatusAction(id: string, status: MessageStatus) {
  const session = await requireAdminSession();
  await contentRepository.updateMessageStatus(id, status);
  await createAuditLog({ actorId: session.userId, action: "UPDATE", resource: "Message", resourceId: id, metadata: { status } });
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(id: string) {
  const session = await requireAdminSession();
  await contentRepository.deleteMessage(id);
  await createAuditLog({ actorId: session.userId, action: "DELETE", resource: "Message", resourceId: id });
  revalidatePath("/admin/messages");
}

export async function submitContactMessageAction(formData: FormData) {
  if (String(formData.get("honeypot") ?? "").trim().length > 0) {
    return { success: true, message: "Message sent" };
  }

  const parsed = messageSchema.safeParse({
    sender: formData.get("sender"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid message payload" };
  }

  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`message:${ip}`, 6, 15 * 60 * 1000);
  if (!limit.allowed) {
    return { success: false, message: `Too many submissions. Retry in ${limit.retryAfterSeconds}s.` };
  }

  await contentRepository.createMessage({
    ...parsed.data,
    ipAddress: ip,
    userAgent: (await headers()).get("user-agent") ?? null,
    metadata: {
      source: "public-contact",
      submittedAt: new Date().toISOString(),
    },
  });

  await trackEvent({ eventType: "CONTACT_SUBMIT", path: "/contact", referrer: (await headers()).get("referer") });

  return { success: true, message: "Message sent" };
}

export async function updateContactPageConfigAction(formData: FormData) {
  const session = await requireAdminSession();
  const payload = contactPageConfigSchema.parse({
    email: String(formData.get("email") ?? ""),
    locationText: String(formData.get("locationText") ?? ""),
    responseTime: String(formData.get("responseTime") ?? ""),
    availabilityEnabled: formData.get("availabilityEnabled") === "on",
    availabilityHeadline: String(formData.get("availabilityHeadline") ?? ""),
    availabilitySubtext: String(formData.get("availabilitySubtext") ?? ""),
    github: String(formData.get("github") ?? ""),
    linkedin: String(formData.get("linkedin") ?? ""),
    additionalLinks: String(formData.get("additionalLinks") ?? ""),
  });

  await contentRepository.upsertContactPageConfig({
    id: "default-contact",
    email: payload.email,
    locationText: payload.locationText,
    responseTime: payload.responseTime,
    socialLinks: {
      github: payload.github,
      linkedin: payload.linkedin,
      additional: parseList(payload.additionalLinks ?? ""),
    },
    availabilityEnabled: payload.availabilityEnabled,
    availabilityHeadline: payload.availabilityHeadline,
    availabilitySubtext: payload.availabilitySubtext,
  });

  await createAuditLog({ actorId: session.userId, action: "UPDATE", resource: "ContactPageConfig", resourceId: "default-contact" });
  revalidatePath("/admin/contact");
  revalidatePath("/contact");
}

export async function createMediaAction(formData: FormData) {
  const session = await requireAdminSession();
  const key = String(formData.get("key") ?? "");
  const url = String(formData.get("url") ?? "");

  const item = await contentRepository.createMedia({
    key,
    url,
    type: String(formData.get("type") ?? "image"),
    size: Number(formData.get("size") ?? 0),
    width: Number(formData.get("width") ?? 0) || null,
    height: Number(formData.get("height") ?? 0) || null,
    tags: parseList(formData.get("tags")),
    usedBy: parseList(formData.get("usedBy")),
  });

  await createAuditLog({ actorId: session.userId, action: "CREATE", resource: "MediaAsset", resourceId: item.id });
  revalidatePath("/admin/media");
}

export async function createResumeAction(formData: FormData) {
  const session = await requireAdminSession();

  const resume = await contentRepository.createResume({
    label: String(formData.get("label") ?? "Version"),
    url: String(formData.get("url") ?? ""),
    isActive: formData.get("isActive") === "on",
  });

  if (resume.isActive) {
    await contentRepository.activateResume(resume.id);
  }

  await createAuditLog({ actorId: session.userId, action: "CREATE", resource: "ResumeFile", resourceId: resume.id });
  revalidatePath("/admin/resume");
}

export async function activateResumeAction(id: string) {
  const session = await requireAdminSession();
  await contentRepository.activateResume(id);
  await createAuditLog({ actorId: session.userId, action: "ACTIVATE", resource: "ResumeFile", resourceId: id });
  revalidatePath("/admin/resume");
}

export async function upsertSeoAction(formData: FormData) {
  const session = await requireAdminSession();

  const pageKey = String(formData.get("pageKey") ?? "home");
  await contentRepository.upsertSeoConfig({
    pageKey,
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    ogImage: String(formData.get("ogImage") ?? ""),
    canonical: String(formData.get("canonical") ?? ""),
  });

  await createAuditLog({ actorId: session.userId, action: "UPSERT", resource: "SeoConfig", resourceId: pageKey });
  revalidatePath("/admin/seo");
}

export async function updateSystemSettingsAction(formData: FormData) {
  const session = await requireAdminSession();

  const payload = siteSettingsSchema.parse({
    siteName: String(formData.get("siteName") ?? ""),
    primaryEmail: String(formData.get("primaryEmail") ?? ""),
    locationText: String(formData.get("locationText") ?? ""),
    responseTimeText: String(formData.get("responseTimeText") ?? ""),
    availabilityEnabled: formData.get("availabilityEnabled") === "on",
    availabilityHeadline: String(formData.get("availabilityHeadline") ?? ""),
    availabilitySubtext: String(formData.get("availabilitySubtext") ?? ""),
    githubUrl: String(formData.get("githubUrl") ?? ""),
    linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
    xUrl: String(formData.get("xUrl") ?? ""),
    accentColor: String(formData.get("accentColor") ?? "cyan"),
    glowIntensity: Number(formData.get("glowIntensity") ?? 0.5),
    borderRadiusScale: Number(formData.get("borderRadiusScale") ?? 1),
    enableProjects: formData.get("enableProjects") === "on",
    enableResearch: formData.get("enableResearch") === "on",
    enableGitHub: formData.get("enableGitHub") === "on",
    enableExperience: formData.get("enableExperience") === "on",
    maintenanceMode: formData.get("maintenanceMode") === "on",
  });

  await contentRepository.upsertSystemSettings({
    id: "default",
    siteName: payload.siteName,
    primaryEmail: payload.primaryEmail,
    locationText: payload.locationText,
    responseTimeText: payload.responseTimeText,
    availabilityEnabled: payload.availabilityEnabled,
    availabilityHeadline: payload.availabilityHeadline,
    availabilitySubtext: payload.availabilitySubtext,
    githubUrl: payload.githubUrl || null,
    linkedinUrl: payload.linkedinUrl || null,
    xUrl: payload.xUrl || null,
    accentColor: payload.accentColor,
    glowIntensity: payload.glowIntensity,
    borderRadiusScale: payload.borderRadiusScale,
    themeMode: "dark",
    enableProjects: payload.enableProjects,
    enableResearch: payload.enableResearch,
    enableGitHub: payload.enableGitHub,
    enableExperience: payload.enableExperience,
    socialLinks: {
      github: payload.githubUrl,
      linkedin: payload.linkedinUrl,
      x: payload.xUrl,
    },
    maintenanceMode: payload.maintenanceMode,
  });

  await logAdminAction({
    actorAdminId: session.userId,
    action: "UPDATE",
    entityType: "SystemSetting",
    entityId: "default",
    summary: "System settings updated",
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/projects");
  revalidatePath("/experience");
  revalidatePath("/research");
}

export async function searchAdminAction(query: string) {
  await requireAdminSession();
  return searchAdmin(query);
}

export async function listContentRevisionsAction(entityType: string, entityId: string) {
  await requireAdminSession();
  return listContentRevisions(entityType, entityId);
}

export async function restoreRevisionAction(revisionId: string) {
  const session = await requireAdminSession();
  const restored = await restoreContentRevision(revisionId, session.userId);

  await logAdminAction({
    actorAdminId: session.userId,
    action: "RESTORE",
    entityType: restored.entityType,
    entityId: restored.entityId,
    summary: `Restored ${restored.entityType} from revision`,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/admin/experience");
  revalidatePath("/admin/research");
  revalidatePath("/projects");
  revalidatePath("/experience");
  revalidatePath("/research");
}

export async function runHealthCheckAction() {
  await requireAdminSession();
  await runHealthCheckReport();
  revalidatePath("/admin/health");
}

export async function runScheduledPublishAction() {
  const session = await requireAdminSession();
  const result = await contentRepository.autoPublishScheduledContent();

  if (result.total > 0) {
    await logAdminAction({
      actorAdminId: session.userId,
      action: "PUBLISH",
      entityType: "Scheduler",
      summary: `Auto-published ${result.total} scheduled items`,
      metadata: result,
    });
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/projects");
  revalidatePath("/experience");
  revalidatePath("/research");

  return result;
}

export async function enablePreviewAction() {
  const session = await requireAdminSession();
  const token = await createPreviewToken({ userId: session.userId, role: "ADMIN" });
  await setPreviewCookie(token);

  await logAdminAction({
    actorAdminId: session.userId,
    action: "ENABLE_PREVIEW",
    entityType: "Preview",
    summary: "Enabled admin preview mode",
  });
}

export async function disablePreviewAction() {
  const session = await requireAdminSession();
  await clearPreviewCookie();

  await logAdminAction({
    actorAdminId: session.userId,
    action: "DISABLE_PREVIEW",
    entityType: "Preview",
    summary: "Disabled admin preview mode",
  });
}
