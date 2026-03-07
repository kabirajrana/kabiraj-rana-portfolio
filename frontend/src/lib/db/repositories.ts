/* eslint-disable @typescript-eslint/no-explicit-any */

import { certifications, experiences } from "@/content/site/experience";
import { projects as fallbackProjects } from "@/content/projects";
import { researchEntries } from "@/data/research";
import { backendApiRequest } from "@/lib/backend-api";

type PublishStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
type MessageStatus = "UNREAD" | "READ" | "ARCHIVED" | "DELETED";
type JsonInput = string | number | boolean | { [key: string]: JsonInput | null } | JsonInput[];

type ProjectWhereInput = Record<string, unknown>;
type ProjectCreateInput = Record<string, unknown>;
type ProjectCategoryCreateInput = Record<string, unknown>;
type ProjectsPageConfigCreateInput = Record<string, unknown>;
type ExperienceCreateInput = Record<string, unknown>;
type ExperiencePageConfigCreateInput = Record<string, unknown>;
type CertificationCreateInput = Record<string, unknown>;
type ResearchWhereInput = Record<string, unknown>;
type ResearchCreateInput = Record<string, unknown>;
type ResearchPageConfigCreateInput = Record<string, unknown>;
type ResearchFilterTabCreateInput = Record<string, unknown>;
type MediaCreateInput = Record<string, unknown>;
type ResumeCreateInput = Record<string, unknown>;
type SeoConfigCreateInput = Record<string, unknown>;
type GitHubSettingCreateInput = Record<string, unknown>;
type SystemSettingCreateInput = Record<string, unknown>;
type ContactPageConfigCreateInput = Record<string, unknown>;

type ApiListResponse<T> = { items: T[]; total?: number };

type DashboardKpis = {
  projects: number;
  research: number;
  experience: number;
  unreadMessages: number;
  cvDownloads: number;
  visitors7d: number;
  visitors30d: number;
};

type TopbarNotifications = {
  unreadMessages: number;
  githubError: string | null;
  githubLastSyncAt: Date | null;
  healthSummary: string | null;
  healthWarnings: number;
  healthErrors: number;
  dueScheduled: number;
};

const dateFieldPattern = /(At|Date)$/;

function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(input)) {
    if (typeof entry === "string" && dateFieldPattern.test(key)) {
      const parsed = new Date(entry);
      output[key] = Number.isNaN(parsed.getTime()) ? entry : parsed;
      continue;
    }

    output[key] = reviveDates(entry);
  }

  return output as T;
}

async function apiGet<T>(path: string): Promise<T | null> {
  const response = await backendApiRequest<T>(path, { method: "GET" });
  return response ? reviveDates(response) : null;
}

async function apiSend<T>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown): Promise<T | null> {
  const response = await backendApiRequest<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return response ? reviveDates(response) : null;
}

function toFallbackProjectRows() {
  return fallbackProjects.map((project, index) => ({
    id: project.slug,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.problem || project.summary,
    year: project.year,
    category: project.category,
    tags: project.tech,
    techStack: project.tech,
    githubUrl: project.links.github,
    liveUrl: project.links.demo,
    featured: project.featured,
    status: "PUBLISHED",
    highlights: project.outcomes,
    screenshots: project.gallery,
    coverImage: project.gallery?.[0] ?? null,
    dataset: null,
    model: null,
    metrics: null,
    results: project.solution,
    architectureDiagram: null,
    sortOrder: index,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

function toFallbackExperienceRows() {
  return experiences.map((item, index) => ({
    id: `exp-${index + 1}`,
    role: item.title,
    org: item.organization,
    timeframe: item.period,
    summary: item.summary,
    techStack: item.tags,
    achievements: item.bullets,
    sidePlacement: "AUTO",
    status: "PUBLISHED",
    currentRole: item.period.toLowerCase().includes("present") || item.period.toLowerCase().includes("current"),
    startDate: new Date(),
    endDate: null,
    sortOrder: index,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  }));
}

function toFallbackCertificationRows() {
  return certifications.map((item, index) => ({
    id: item.id,
    title: item.title,
    codeLabel: `CERT-${index + 1}`,
    issuer: "Certification Provider",
    issuedDate: null,
    credentialUrl: item.href,
    isVisible: true,
    sortOrder: index,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

function toFallbackResearchRows() {
  return researchEntries.map((entry, index) => ({
    id: entry.id,
    slug: entry.id,
    title: entry.title,
    summary: entry.description,
    content: {
      type: "NOTE",
      sections: [
        {
          id: `section-${index + 1}`,
          title: entry.title,
          body: entry.results,
        },
      ],
    },
    type: "NOTE",
    category: entry.category,
    tags: entry.tags,
    year: Number(new Date().getFullYear()),
    status: "PUBLISHED",
    featured: index < 3,
    authors: ["Kabiraj Rana"],
    affiliation: null,
    researchArea: entry.category,
    dataset: entry.dataset,
    duration: null,
    pdfUrl: null,
    codeUrl: null,
    demoUrl: null,
    notesUrl: null,
    coverImage: null,
    citation: null,
    references: [],
    relatedSlugs: [],
    seoTitle: null,
    seoDescription: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

async function getListFromApi<T>(path: string): Promise<T[]> {
  const response = await apiGet<ApiListResponse<T> | T[]>(path);
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? [];
}

export const dashboardRepository = {
  async getKpis() {
    const fallback: DashboardKpis = {
      projects: toFallbackProjectRows().length,
      research: toFallbackResearchRows().length,
      experience: toFallbackExperienceRows().length,
      unreadMessages: 0,
      cvDownloads: 0,
      visitors7d: 0,
      visitors30d: 0,
    };

    return (await apiGet<DashboardKpis>("/v1/admin/dashboard/kpis")) ?? fallback;
  },

  async getRecentActivity() {
    return await getListFromApi<Record<string, any>>("/v1/admin/dashboard/recent-activity");
  },

  async getTopbarNotifications(): Promise<TopbarNotifications> {
    return (
      (await apiGet<TopbarNotifications>("/v1/admin/dashboard/topbar-notifications")) ?? {
        unreadMessages: 0,
        githubError: null,
        githubLastSyncAt: null,
        healthSummary: null,
        healthWarnings: 0,
        healthErrors: 0,
        dueScheduled: 0,
      }
    );
  },
};

export const contentRepository = {
  async listProjects(where?: ProjectWhereInput) {
    const query = where ? `?where=${encodeURIComponent(JSON.stringify(where))}` : "";
    const rows = await getListFromApi<Record<string, any>>(`/v1/content/projects${query}`);
    return rows.length ? rows : toFallbackProjectRows();
  },

  async listProjectsPaged(input: {
    query?: string;
    category?: string;
    status?: PublishStatus;
    page: number;
    pageSize: number;
  }) {
    const params = new URLSearchParams();
    if (input.query) params.set("query", input.query);
    if (input.category) params.set("category", input.category);
    if (input.status) params.set("status", input.status);
    params.set("page", String(input.page));
    params.set("pageSize", String(input.pageSize));

    const response = await apiGet<ApiListResponse<Record<string, any>>>(`/v1/content/projects/paged?${params.toString()}`);
    if (response?.items) {
      return [response.items, response.total ?? response.items.length] as const;
    }

    const fallback = toFallbackProjectRows();
    return [fallback.slice(0, input.pageSize), fallback.length] as const;
  },

  async upsertProject(input: ProjectCreateInput & { id?: string }) {
    const method = input.id ? "PUT" : "POST";
    const path = input.id ? `/v1/admin/content/projects/${input.id}` : "/v1/admin/content/projects";
    return (await apiSend<Record<string, any>>(path, method, input)) ?? input;
  },

  async deleteProject(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/content/projects/${id}`, "DELETE")) ?? { id };
  },

  async reorderProjects(ids: string[]) {
    await apiSend("/v1/admin/content/projects/reorder", "POST", { ids });
  },

  async listProjectCategories() {
    return await getListFromApi<Record<string, any>>("/v1/content/projects/categories");
  },

  async upsertProjectCategory(input: ProjectCategoryCreateInput & { id?: string }) {
    const method = input.id ? "PUT" : "POST";
    const path = input.id ? `/v1/admin/content/project-categories/${input.id}` : "/v1/admin/content/project-categories";
    return (await apiSend<Record<string, any>>(path, method, input)) ?? input;
  },

  async deleteProjectCategory(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/content/project-categories/${id}`, "DELETE")) ?? { id };
  },

  async reorderProjectCategories(ids: string[]) {
    await apiSend("/v1/admin/content/project-categories/reorder", "POST", { ids });
  },

  async getProjectsPageConfig() {
    return await apiGet<Record<string, any>>("/v1/content/projects/page-config");
  },

  async upsertProjectsPageConfig(input: ProjectsPageConfigCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/content/projects/page-config", "PUT", input)) ?? input;
  },

  async listExperience() {
    const rows = await getListFromApi<Record<string, any>>("/v1/content/experience");
    return rows.length ? rows : toFallbackExperienceRows();
  },

  async upsertExperience(input: ExperienceCreateInput & { id?: string }) {
    const method = input.id ? "PUT" : "POST";
    const path = input.id ? `/v1/admin/content/experience/${input.id}` : "/v1/admin/content/experience";
    return (await apiSend<Record<string, any>>(path, method, input)) ?? input;
  },

  async deleteExperience(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/content/experience/${id}`, "DELETE")) ?? { count: 0 };
  },

  async getExperiencePageConfig() {
    return await apiGet<Record<string, any>>("/v1/content/experience/page-config");
  },

  async upsertExperiencePageConfig(input: ExperiencePageConfigCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/content/experience/page-config", "PUT", input)) ?? input;
  },

  async listCertifications() {
    const rows = await getListFromApi<Record<string, any>>("/v1/content/certifications?visible=1");
    return rows.length ? rows : toFallbackCertificationRows();
  },

  async listAllCertifications() {
    const rows = await getListFromApi<Record<string, any>>("/v1/content/certifications");
    return rows.length ? rows : toFallbackCertificationRows();
  },

  async upsertCertification(input: CertificationCreateInput & { id?: string }) {
    const method = input.id ? "PUT" : "POST";
    const path = input.id ? `/v1/admin/content/certifications/${input.id}` : "/v1/admin/content/certifications";
    return (await apiSend<Record<string, any>>(path, method, input)) ?? input;
  },

  async deleteCertification(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/content/certifications/${id}`, "DELETE")) ?? { count: 0 };
  },

  async reorderExperience(ids: string[]) {
    await apiSend("/v1/admin/content/experience/reorder", "POST", { ids });
  },

  async listResearch(where?: ResearchWhereInput) {
    const query = where ? `?where=${encodeURIComponent(JSON.stringify(where))}` : "";
    const rows = await getListFromApi<Record<string, any>>(`/v1/content/research${query}`);
    return rows.length ? rows : toFallbackResearchRows();
  },

  async listResearchPaged(input: {
    query?: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    type?: "EXPERIMENT" | "PAPER" | "SYSTEM" | "THESIS" | "NOTE";
    year?: number;
    tag?: string;
    page: number;
    pageSize: number;
  }) {
    const params = new URLSearchParams();
    if (input.query) params.set("query", input.query);
    if (input.status) params.set("status", input.status);
    if (input.type) params.set("type", input.type);
    if (input.year) params.set("year", String(input.year));
    if (input.tag) params.set("tag", input.tag);
    params.set("page", String(input.page));
    params.set("pageSize", String(input.pageSize));

    const response = await apiGet<ApiListResponse<Record<string, any>>>(`/v1/content/research/paged?${params.toString()}`);
    if (response?.items) {
      return [response.items, response.total ?? response.items.length] as const;
    }

    const fallback = toFallbackResearchRows();
    return [fallback.slice(0, input.pageSize), fallback.length] as const;
  },

  async getResearchBySlug(slug: string) {
    const row = await apiGet<Record<string, any>>(`/v1/content/research/by-slug/${encodeURIComponent(slug)}`);
    if (row) {
      return row;
    }

    const fallback = toFallbackResearchRows();
    return fallback.find((item) => item.slug === slug) ?? null;
  },

  async getResearchById(id: string) {
    const row = await apiGet<Record<string, any>>(`/v1/content/research/by-id/${encodeURIComponent(id)}`);
    if (row) {
      return row;
    }

    const fallback = toFallbackResearchRows();
    return fallback.find((item) => item.id === id) ?? null;
  },

  async getAdjacentResearch(input: { publishedAt?: Date | null; year: number; id: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
    const payload = {
      ...input,
      publishedAt: input.publishedAt ? input.publishedAt.toISOString() : null,
    };

    const response = await apiSend<[Record<string, any> | null, Record<string, any> | null]>("/v1/content/research/adjacent", "POST", payload);
    if (response) {
      return response;
    }

    return [null, null] as const;
  },

  async listRelatedResearch(slugs: string[], excludeId?: string) {
    if (!slugs.length) {
      return [];
    }

    const response = await apiSend<Record<string, any>[]>("/v1/content/research/related", "POST", { slugs, excludeId });
    if (response) {
      return response;
    }

    const fallback = toFallbackResearchRows();
    return fallback.filter((item) => slugs.includes(String(item.slug)) && item.id !== excludeId);
  },

  async upsertResearch(input: ResearchCreateInput & { id?: string }) {
    const method = input.id ? "PUT" : "POST";
    const path = input.id ? `/v1/admin/content/research/${input.id}` : "/v1/admin/content/research";
    return (await apiSend<Record<string, any>>(path, method, input)) ?? input;
  },

  async deleteResearch(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/content/research/${id}`, "DELETE")) ?? { id };
  },

  async getResearchPageConfig() {
    return await apiGet<Record<string, any>>("/v1/content/research/page-config");
  },

  async upsertResearchPageConfig(input: ResearchPageConfigCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/content/research/page-config", "PUT", input)) ?? input;
  },

  async listResearchFilterTabs() {
    return await getListFromApi<Record<string, any>>("/v1/content/research/filter-tabs?visible=1");
  },

  async listAllResearchFilterTabs() {
    return await getListFromApi<Record<string, any>>("/v1/content/research/filter-tabs");
  },

  async upsertResearchFilterTab(input: ResearchFilterTabCreateInput & { id?: string }) {
    const method = input.id ? "PUT" : "POST";
    const path = input.id ? `/v1/admin/content/research/filter-tabs/${input.id}` : "/v1/admin/content/research/filter-tabs";
    return (await apiSend<Record<string, any>>(path, method, input)) ?? input;
  },

  async deleteResearchFilterTab(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/content/research/filter-tabs/${id}`, "DELETE")) ?? { id };
  },

  async reorderResearch(ids: string[]) {
    await apiSend("/v1/admin/content/research/reorder", "POST", { ids });
  },

  async getHomeContent() {
    return await apiGet<Record<string, any>>("/v1/content/site/home");
  },

  async upsertHomeContent(data: JsonInput, status: PublishStatus, userId?: string, scheduledAt?: Date | null) {
    const payload = {
      data,
      status,
      userId,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
    };

    return (await apiSend<Record<string, any>>("/v1/admin/content/site/home", "PUT", payload)) ?? { id: "home", ...payload };
  },

  async getAboutContent() {
    return await apiGet<Record<string, any>>("/v1/content/site/about");
  },

  async upsertAboutContent(data: JsonInput, status: PublishStatus, userId?: string, scheduledAt?: Date | null) {
    const payload = {
      data,
      status,
      userId,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
    };

    return (await apiSend<Record<string, any>>("/v1/admin/content/site/about", "PUT", payload)) ?? { id: "about", ...payload };
  },

  async listMessages(status?: MessageStatus) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return await getListFromApi<Record<string, any>>(`/v1/admin/messages${query}`);
  },

  async createMessage(input: Record<string, unknown>) {
    return (await apiSend<Record<string, any>>("/v1/admin/messages", "POST", input)) ?? input;
  },

  async updateMessageStatus(id: string, status: MessageStatus) {
    return (await apiSend<Record<string, any>>(`/v1/admin/messages/${id}/status`, "PATCH", { status })) ?? { id, status };
  },

  async deleteMessage(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/messages/${id}`, "DELETE")) ?? { id };
  },

  async listMedia(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return await getListFromApi<Record<string, any>>(`/v1/admin/media${query}`);
  },

  async createMedia(input: MediaCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/media", "POST", input)) ?? input;
  },

  async listResumes() {
    return await getListFromApi<Record<string, any>>("/v1/admin/resumes");
  },

  async createResume(input: ResumeCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/resumes", "POST", input)) ?? input;
  },

  async activateResume(id: string) {
    return (await apiSend<Record<string, any>>(`/v1/admin/resumes/${id}/activate`, "POST")) ?? { id, isActive: true };
  },

  async listSeoConfigs() {
    return await getListFromApi<Record<string, any>>("/v1/admin/seo/configs");
  },

  async upsertSeoConfig(input: SeoConfigCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/seo/configs", "PUT", input)) ?? input;
  },

  async getGithubSettings() {
    return await apiGet<Record<string, any>>("/v1/admin/github/settings");
  },

  async upsertGithubSettings(input: GitHubSettingCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/github/settings", "PUT", input)) ?? input;
  },

  async getSystemSettings() {
    return (
      (await apiGet<Record<string, any>>("/v1/content/system/settings")) ?? {
        id: "default",
        enableProjects: true,
        enableResearch: true,
        enableExperience: true,
      }
    );
  },

  async upsertSystemSettings(input: SystemSettingCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/system/settings", "PUT", input)) ?? input;
  },

  async listAuditLogs(input: {
    entityType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const params = new URLSearchParams();
    if (input.entityType) params.set("entityType", input.entityType);
    if (input.action) params.set("action", input.action);
    if (input.startDate) params.set("startDate", input.startDate.toISOString());
    if (input.endDate) params.set("endDate", input.endDate.toISOString());

    return await getListFromApi<Record<string, any>>(`/v1/admin/audit-logs?${params.toString()}`);
  },

  async autoPublishScheduledContent() {
    return (
      (await apiSend<Record<string, any>>("/v1/admin/content/publish-scheduled", "POST")) ?? {
        projects: 0,
        experiences: 0,
        research: 0,
        siteContents: 0,
        total: 0,
      }
    );
  },

  async getContactPageConfig() {
    return await apiGet<Record<string, any>>("/v1/content/contact/config");
  },

  async getLatestHealthReport() {
    return await apiGet<Record<string, any>>("/v1/admin/health/reports/latest");
  },

  async upsertContactPageConfig(input: ContactPageConfigCreateInput) {
    return (await apiSend<Record<string, any>>("/v1/admin/content/contact/config", "PUT", input)) ?? input;
  },

  async findProjectBySlug(slug: string) {
    return await apiGet<Record<string, any>>(`/v1/content/projects/by-slug/${encodeURIComponent(slug)}`);
  },

  async findResearchBySlug(slug: string) {
    return await apiGet<Record<string, any>>(`/v1/content/research/by-slug/${encodeURIComponent(slug)}`);
  },

  async getAdminUserByEmail(email: string) {
    return await apiGet<Record<string, any>>(`/v1/admin/users/by-email?email=${encodeURIComponent(email)}`);
  },

  async updateAdminLastLogin(id: string) {
    await apiSend(`/v1/admin/users/${encodeURIComponent(id)}/touch-login`, "POST");
  },
};
