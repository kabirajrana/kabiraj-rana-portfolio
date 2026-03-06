import { prisma } from "@/lib/db/prisma";
import { researchDelegate } from "@/lib/db/research-delegate";

function isUrlValid(url?: string | null) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export type HealthCheckItem = {
  key: string;
  level: "ok" | "warning" | "error";
  message: string;
  count: number;
  href?: string;
};

type HealthProject = { id: string; title: string; githubUrl: string | null; liveUrl: string | null; featured: boolean; coverImage: string | null; status: string };
type HealthResearch = { id: string; title: string; codeUrl: string | null; featured: boolean; coverImage: string | null; status: string };
type HealthCertification = { id: string; title: string; credentialUrl: string };
type HealthSeo = { pageKey: string; metaTitle: string; metaDescription: string };
type HealthMedia = { id: string; key: string; usedBy: unknown };

export async function runHealthCheckReport() {
  const [projects, research, certifications, seo, media, github] = await Promise.all([
    prisma.project.findMany({ select: { id: true, title: true, githubUrl: true, liveUrl: true, featured: true, coverImage: true, status: true } }),
    researchDelegate.findMany({ select: { id: true, title: true, codeUrl: true, featured: true, coverImage: true, status: true } }),
    prisma.certification.findMany({ select: { id: true, title: true, credentialUrl: true } }),
    prisma.seoConfig.findMany({ select: { pageKey: true, metaTitle: true, metaDescription: true } }),
    prisma.mediaAsset.findMany({ select: { id: true, key: true, usedBy: true } }),
    prisma.gitHubSetting.findFirst({ orderBy: { updatedAt: "desc" }, select: { lastError: true, lastSyncAt: true } }),
  ]);

  const typedProjects = projects as HealthProject[];
  const typedResearch = research as unknown as HealthResearch[];
  const typedCertifications = certifications as HealthCertification[];
  const typedSeo = seo as HealthSeo[];
  const typedMedia = media as HealthMedia[];

  const brokenLinks = [
    ...typedProjects.filter((item: HealthProject) => item.githubUrl && !isUrlValid(item.githubUrl)),
    ...typedProjects.filter((item: HealthProject) => item.liveUrl && !isUrlValid(item.liveUrl)),
    ...typedResearch.filter((item: HealthResearch) => item.codeUrl && !isUrlValid(item.codeUrl)),
    ...typedCertifications.filter((item: HealthCertification) => !isUrlValid(item.credentialUrl)),
  ];

  const requiredPages = ["home", "about", "projects", "experience", "research", "contact"];
  const seoMissingCount = requiredPages.filter((key) => {
    const record = typedSeo.find((item: HealthSeo) => item.pageKey === key);
    return !record || !record.metaTitle || !record.metaDescription;
  }).length;

  const featuredMissingImage = typedProjects.filter((item: HealthProject) => item.featured && !item.coverImage).length;
  const featuredResearchMissingImage = typedResearch.filter((item: HealthResearch) => item.featured && !item.coverImage).length;

  const unpublishedCount = typedProjects.filter((item: HealthProject) => item.status !== "PUBLISHED").length
    + typedResearch.filter((item: HealthResearch) => item.status !== "PUBLISHED").length;

  const orphanedMedia = typedMedia.filter((asset: HealthMedia) => !Array.isArray(asset.usedBy) || (asset.usedBy as unknown[]).length === 0).length;

  const checks: HealthCheckItem[] = [
    {
      key: "broken-links",
      level: brokenLinks.length ? "error" : "ok",
      message: brokenLinks.length ? `${brokenLinks.length} invalid links detected` : "No invalid links detected",
      count: brokenLinks.length,
      href: "/admin/projects",
    },
    {
      key: "missing-seo",
      level: seoMissingCount ? "warning" : "ok",
      message: seoMissingCount ? `${seoMissingCount} pages missing SEO metadata` : "SEO metadata is complete",
      count: seoMissingCount,
      href: "/admin/seo",
    },
    {
      key: "missing-featured-images",
      level: featuredMissingImage + featuredResearchMissingImage ? "warning" : "ok",
      message: featuredMissingImage + featuredResearchMissingImage
        ? `${featuredMissingImage + featuredResearchMissingImage} featured items missing images`
        : "Featured items have images",
      count: featuredMissingImage + featuredResearchMissingImage,
      href: "/admin/media",
    },
    {
      key: "unpublished-content",
      level: unpublishedCount ? "warning" : "ok",
      message: unpublishedCount ? `${unpublishedCount} items are still unpublished` : "All tracked content is published",
      count: unpublishedCount,
      href: "/admin/projects",
    },
    {
      key: "orphaned-media",
      level: orphanedMedia ? "warning" : "ok",
      message: orphanedMedia ? `${orphanedMedia} media assets are unreferenced` : "No orphaned media assets",
      count: orphanedMedia,
      href: "/admin/media",
    },
    {
      key: "github-sync",
      level: github?.lastError ? "warning" : "ok",
      message: github?.lastError ? `GitHub sync issue: ${github.lastError}` : "GitHub sync healthy",
      count: github?.lastError ? 1 : 0,
      href: "/admin/github",
    },
  ];

  const warnings = checks.filter((item) => item.level === "warning").length;
  const errors = checks.filter((item) => item.level === "error").length;

  const report = await prisma.healthReport.create({
    data: {
      checks: checks as never,
      warnings,
      errors,
      summary: `${errors} errors · ${warnings} warnings`,
    },
  });

  return { report, checks, warnings, errors };
}
