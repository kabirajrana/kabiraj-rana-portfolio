import { prisma } from "@/lib/db/prisma";
import { researchDelegate } from "@/lib/db/research-delegate";

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

export const dashboardRepository = {
  async getKpis() {
    const [projects, research, experience, unreadMessages, activeResume] = await Promise.all([
      prisma.project.count(),
      researchDelegate.count(),
      prisma.experience.count(),
      prisma.message.count({ where: { status: "UNREAD" } }),
      prisma.resumeFile.findFirst({ where: { isActive: true } }),
    ]);

    const visitors7d = await prisma.analyticsEvent.count({
      where: {
        eventType: "PAGE_VIEW",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const visitors30d = await prisma.analyticsEvent.count({
      where: {
        eventType: "PAGE_VIEW",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    return {
      projects,
      research,
      experience,
      unreadMessages,
      cvDownloads: activeResume?.downloadCount ?? 0,
      visitors7d,
      visitors30d,
    };
  },

  async getRecentActivity() {
    return prisma.auditLog.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  },

  async getTopbarNotifications() {
    const [unreadMessages, githubSettings, latestHealth, dueScheduled] = await Promise.all([
      prisma.message.count({ where: { status: "UNREAD" } }),
      prisma.gitHubSetting.findFirst({ orderBy: { updatedAt: "desc" }, select: { lastError: true, lastSyncAt: true } }),
      prisma.healthReport.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.project.count({ where: { status: "SCHEDULED", scheduledAt: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } } }),
    ]);

    return {
      unreadMessages,
      githubError: githubSettings?.lastError ?? null,
      githubLastSyncAt: githubSettings?.lastSyncAt ?? null,
      healthSummary: latestHealth?.summary ?? null,
      healthWarnings: latestHealth?.warnings ?? 0,
      healthErrors: latestHealth?.errors ?? 0,
      dueScheduled,
    };
  },
};

export const contentRepository = {
  listProjects(where?: ProjectWhereInput) {
    return prisma.project.findMany({ where: where as never, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }] });
  },
  listProjectsPaged(input: {
    query?: string;
    category?: string;
    status?: PublishStatus;
    page: number;
    pageSize: number;
  }) {
    const where: ProjectWhereInput = {
      ...(input.query
        ? {
            OR: [
              { title: { contains: input.query, mode: "insensitive" } },
              { summary: { contains: input.query, mode: "insensitive" } },
              { description: { contains: input.query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.category && input.category !== "all" ? { category: input.category } : {}),
      ...(input.status ? { status: input.status } : {}),
    };

    return Promise.all([
      prisma.project.findMany({
        where: where as never,
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
        skip: Math.max(0, (input.page - 1) * input.pageSize),
        take: input.pageSize,
      }),
      prisma.project.count({ where: where as never }),
    ]);
  },
  upsertProject(input: ProjectCreateInput & { id?: string }) {
    const now = new Date();
    const status = input.status;
    const publishedAt = status === "PUBLISHED" ? now : null;
    const scheduledAt = status === "SCHEDULED" ? input.scheduledAt ?? now : null;

    if (input.id) {
      return prisma.project.update({
        where: { id: input.id },
        data: {
          ...input,
          publishedAt,
          scheduledAt,
        } as never,
      });
    }
    return prisma.project.create({
      data: {
        ...input,
        publishedAt,
        scheduledAt,
      } as never,
    });
  },
  deleteProject(id: string) {
    return prisma.project.delete({ where: { id } });
  },
  listProjectCategories() {
    return prisma.projectCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  },
  upsertProjectCategory(input: ProjectCategoryCreateInput & { id?: string }) {
    if (input.id) {
      return prisma.projectCategory.update({ where: { id: input.id }, data: input as never });
    }
    return prisma.projectCategory.create({ data: input as never });
  },
  deleteProjectCategory(id: string) {
    return prisma.projectCategory.delete({ where: { id } });
  },
  async reorderProjectCategories(ids: string[]) {
    await Promise.all(ids.map((id, idx) => prisma.projectCategory.update({ where: { id }, data: { sortOrder: idx } })));
  },
  getProjectsPageConfig() {
    return prisma.projectsPageConfig.findUnique({ where: { id: "default-projects" } });
  },
  upsertProjectsPageConfig(input: ProjectsPageConfigCreateInput) {
    return prisma.projectsPageConfig.upsert({
      where: { id: "default-projects" },
      update: input as never,
      create: { ...input, id: "default-projects" } as never,
    });
  },

  listExperience() {
    return prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] });
  },
  upsertExperience(input: ExperienceCreateInput & { id?: string }) {
    const now = new Date();
    const status = input.status;
    const publishedAt = status === "PUBLISHED" ? now : null;
    const scheduledAt = status === "SCHEDULED" ? input.scheduledAt ?? now : null;

    if (input.id) {
      return prisma.experience.update({
        where: { id: input.id },
        data: {
          ...input,
          publishedAt,
          scheduledAt,
        } as never,
      });
    }
    return prisma.experience.create({
      data: {
        ...input,
        publishedAt,
        scheduledAt,
      } as never,
    });
  },
  deleteExperience(id: string) {
    return prisma.experience.deleteMany({ where: { id } });
  },
  getExperiencePageConfig() {
    return prisma.experiencePageConfig.findUnique({ where: { id: "default-experience" } });
  },
  upsertExperiencePageConfig(input: ExperiencePageConfigCreateInput) {
    return prisma.experiencePageConfig.upsert({
      where: { id: "default-experience" },
      update: input as never,
      create: { ...input, id: "default-experience" } as never,
    });
  },
  listCertifications() {
    return prisma.certification.findMany({ where: { isVisible: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  },
  listAllCertifications() {
    return prisma.certification.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  },
  upsertCertification(input: CertificationCreateInput & { id?: string }) {
    if (input.id) {
      return prisma.certification.update({ where: { id: input.id }, data: input as never });
    }
    return prisma.certification.create({ data: input as never });
  },
  deleteCertification(id: string) {
    return prisma.certification.deleteMany({ where: { id } });
  },
  async reorderExperience(ids: string[]) {
    await Promise.all(ids.map((id, idx) => prisma.experience.update({ where: { id }, data: { sortOrder: idx } })));
  },

  listResearch(where?: ResearchWhereInput) {
    return researchDelegate.findMany({ where: where as never, orderBy: [{ featured: "desc" }, { year: "desc" }, { updatedAt: "desc" }] });
  },
  listResearchPaged(input: {
    query?: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    type?: "EXPERIMENT" | "PAPER" | "SYSTEM" | "THESIS" | "NOTE";
    year?: number;
    tag?: string;
    page: number;
    pageSize: number;
  }) {
    const where: ResearchWhereInput = {
      ...(input.query
        ? {
            OR: [
              { title: { contains: input.query, mode: "insensitive" } },
              { summary: { contains: input.query, mode: "insensitive" } },
              { researchArea: { contains: input.query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.type ? { type: input.type } : {}),
      ...(input.year ? { year: input.year } : {}),
      ...(input.tag ? { tags: { has: input.tag } } : {}),
    };

    return Promise.all([
      researchDelegate.findMany({
        where: where as never,
        orderBy: [{ featured: "desc" }, { year: "desc" }, { updatedAt: "desc" }],
        skip: Math.max(0, (input.page - 1) * input.pageSize),
        take: input.pageSize,
      }),
      researchDelegate.count({ where: where as never }),
    ]);
  },
  getResearchBySlug(slug: string) {
    return researchDelegate.findUnique({ where: { slug } });
  },
  getAdjacentResearch(input: { publishedAt?: Date | null; year: number; id: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
    const status = input.status ?? "PUBLISHED";
    return Promise.all([
      researchDelegate.findFirst({
        where: {
          status,
          id: { not: input.id },
          OR: [
            { year: { lt: input.year } },
            ...(input.publishedAt ? [{ publishedAt: { lt: input.publishedAt } }] : []),
          ],
        },
        orderBy: [{ year: "desc" }, { publishedAt: "desc" }, { updatedAt: "desc" }],
      }),
      researchDelegate.findFirst({
        where: {
          status,
          id: { not: input.id },
          OR: [
            { year: { gt: input.year } },
            ...(input.publishedAt ? [{ publishedAt: { gt: input.publishedAt } }] : []),
          ],
        },
        orderBy: [{ year: "asc" }, { publishedAt: "asc" }, { updatedAt: "asc" }],
      }),
    ]);
  },
  listRelatedResearch(slugs: string[], excludeId?: string) {
    if (!slugs.length) {
      return Promise.resolve([]);
    }

    return researchDelegate.findMany({
      where: {
        slug: { in: slugs },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      } as never,
      orderBy: [{ featured: "desc" }, { year: "desc" }, { updatedAt: "desc" }],
    });
  },
  upsertResearch(input: ResearchCreateInput & { id?: string }) {
    const status = input.status;
    const now = new Date();
    const publishedAt = status === "PUBLISHED" ? input.publishedAt ?? now : null;

    if (input.id) {
      return researchDelegate.update({
        where: { id: input.id },
        data: {
          ...input,
          publishedAt,
        } as never,
      });
    }
    return researchDelegate.create({
      data: {
        ...input,
        publishedAt,
      } as never,
    });
  },
  deleteResearch(id: string) {
    return researchDelegate.delete({ where: { id } });
  },
  getResearchPageConfig() {
    return prisma.researchPageConfig.findUnique({ where: { id: "default-research" } });
  },
  upsertResearchPageConfig(input: ResearchPageConfigCreateInput) {
    return prisma.researchPageConfig.upsert({
      where: { id: "default-research" },
      update: input as never,
      create: { ...input, id: "default-research" } as never,
    });
  },
  listResearchFilterTabs() {
    return prisma.researchFilterTab.findMany({ where: { isVisible: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  },
  listAllResearchFilterTabs() {
    return prisma.researchFilterTab.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  },
  upsertResearchFilterTab(input: ResearchFilterTabCreateInput & { id?: string }) {
    if (input.id) {
      return prisma.researchFilterTab.update({ where: { id: input.id }, data: input as never });
    }
    return prisma.researchFilterTab.create({ data: input as never });
  },
  deleteResearchFilterTab(id: string) {
    return prisma.researchFilterTab.delete({ where: { id } });
  },
  async reorderResearch(ids: string[]) {
    void ids;
  },

  getHomeContent() {
    return prisma.siteContent.findUnique({ where: { type: "HOME" } });
  },
  upsertHomeContent(data: JsonInput, status: PublishStatus, userId?: string, scheduledAt?: Date | null) {
    const now = new Date();
    return prisma.siteContent.upsert({
      where: { type: "HOME" },
      update: {
        draftJson: data,
        status,
        publishedAt: status === "PUBLISHED" ? now : null,
        scheduledAt: status === "SCHEDULED" ? scheduledAt ?? now : null,
        updatedById: userId,
        ...(status === "PUBLISHED" ? { publishedJson: data } : {}),
      },
      create: {
        type: "HOME",
        draftJson: data,
        status,
        publishedAt: status === "PUBLISHED" ? now : null,
        scheduledAt: status === "SCHEDULED" ? scheduledAt ?? now : null,
        updatedById: userId,
        ...(status === "PUBLISHED" ? { publishedJson: data } : {}),
      },
    });
  },

  getAboutContent() {
    return prisma.siteContent.findUnique({ where: { type: "ABOUT" } });
  },
  upsertAboutContent(data: JsonInput, status: PublishStatus, userId?: string, scheduledAt?: Date | null) {
    const now = new Date();
    return prisma.siteContent.upsert({
      where: { type: "ABOUT" },
      update: {
        draftJson: data,
        status,
        publishedAt: status === "PUBLISHED" ? now : null,
        scheduledAt: status === "SCHEDULED" ? scheduledAt ?? now : null,
        updatedById: userId,
        ...(status === "PUBLISHED" ? { publishedJson: data } : {}),
      },
      create: {
        type: "ABOUT",
        draftJson: data,
        status,
        publishedAt: status === "PUBLISHED" ? now : null,
        scheduledAt: status === "SCHEDULED" ? scheduledAt ?? now : null,
        updatedById: userId,
        ...(status === "PUBLISHED" ? { publishedJson: data } : {}),
      },
    });
  },

  listMessages(status?: MessageStatus) {
    return prisma.message.findMany({
      where: status ? { status } as never : undefined,
      orderBy: { createdAt: "desc" },
    });
  },
  updateMessageStatus(id: string, status: MessageStatus) {
    return prisma.message.update({ where: { id }, data: { status } });
  },
  deleteMessage(id: string) {
    return prisma.message.delete({ where: { id } });
  },

  listMedia(search?: string) {
    return prisma.mediaAsset.findMany({
      where: search
        ? {
            OR: [{ key: { contains: search, mode: "insensitive" } }, { url: { contains: search, mode: "insensitive" } }],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
  },
  createMedia(input: MediaCreateInput) {
    return prisma.mediaAsset.create({ data: input as never });
  },

  listResumes() {
    return prisma.resumeFile.findMany({ orderBy: { createdAt: "desc" } });
  },
  createResume(input: ResumeCreateInput) {
    return prisma.resumeFile.create({ data: input as never });
  },
  async activateResume(id: string) {
    await prisma.resumeFile.updateMany({ data: { isActive: false } });
    return prisma.resumeFile.update({ where: { id }, data: { isActive: true } });
  },

  listSeoConfigs() {
    return prisma.seoConfig.findMany({ orderBy: { pageKey: "asc" } });
  },
  upsertSeoConfig(input: SeoConfigCreateInput) {
    return prisma.seoConfig.upsert({
      where: { pageKey: String(input.pageKey ?? "") },
      update: {
        metaTitle: String(input.metaTitle ?? ""),
        metaDescription: String(input.metaDescription ?? ""),
        ogImage: (input.ogImage as string | null | undefined) ?? null,
        canonical: (input.canonical as string | null | undefined) ?? null,
      },
      create: input as never,
    });
  },

  getGithubSettings() {
    return prisma.gitHubSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  },
  upsertGithubSettings(input: GitHubSettingCreateInput) {
    return prisma.gitHubSetting.upsert({ where: { id: String(input.id ?? "default") }, update: input as never, create: input as never });
  },

  getSystemSettings() {
    return prisma.systemSetting.findUnique({ where: { id: "default" } });
  },
  upsertSystemSettings(input: SystemSettingCreateInput) {
    return prisma.systemSetting.upsert({ where: { id: "default" }, update: input as never, create: { ...input, id: "default" } as never });
  },

  listAuditLogs(input: {
    entityType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.auditLog.findMany({
      where: {
        ...(input.entityType ? { entityType: input.entityType } : {}),
        ...(input.action ? { action: input.action } : {}),
        ...(input.startDate || input.endDate
          ? {
              createdAt: {
                ...(input.startDate ? { gte: input.startDate } : {}),
                ...(input.endDate ? { lte: input.endDate } : {}),
              },
            }
          : {}),
      },
      include: {
        actor: {
          select: { email: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  },

  async autoPublishScheduledContent() {
    const now = new Date();

    const [projects, experiences, research, siteContents] = await Promise.all([
      prisma.project.updateMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now } }, data: { status: "PUBLISHED", publishedAt: now } }),
      prisma.experience.updateMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now } }, data: { status: "PUBLISHED", publishedAt: now } }),
      researchDelegate.updateMany({ where: { status: "DRAFT", publishedAt: { lte: now } }, data: { status: "PUBLISHED" } }),
      prisma.siteContent.updateMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now } }, data: { status: "PUBLISHED", publishedAt: now } }),
    ]);

    return {
      projects: projects.count,
      experiences: experiences.count,
      research: research.count,
      siteContents: siteContents.count,
      total: projects.count + experiences.count + research.count + siteContents.count,
    };
  },

  getContactPageConfig() {
    return prisma.contactPageConfig.findUnique({ where: { id: "default-contact" } });
  },
  upsertContactPageConfig(input: ContactPageConfigCreateInput) {
    return prisma.contactPageConfig.upsert({
      where: { id: "default-contact" },
      update: input as never,
      create: { ...input, id: "default-contact" } as never,
    });
  },
};
