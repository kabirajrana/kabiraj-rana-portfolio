import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { getCurrentAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { researchDelegate, txResearchDelegate } from "@/lib/db/research-delegate";

const backupSchema = z.object({
  siteContent: z.array(z.record(z.string(), z.unknown())).optional(),
  projects: z.array(z.record(z.string(), z.unknown())).optional(),
  experience: z.array(z.record(z.string(), z.unknown())).optional(),
  research: z.array(z.record(z.string(), z.unknown())).optional(),
  seo: z.array(z.record(z.string(), z.unknown())).optional(),
  system: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [siteContent, projects, experience, research, seo, github, system] = await Promise.all([
    prisma.siteContent.findMany(),
    prisma.project.findMany(),
    prisma.experience.findMany(),
    researchDelegate.findMany(),
    prisma.seoConfig.findMany(),
    prisma.gitHubSetting.findMany(),
    prisma.systemSetting.findMany(),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    siteContent,
    projects,
    experience,
    research,
    seo,
    github,
    system,
  });
}

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  const parsed = backupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid backup payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  const counts = {
    siteContent: payload.siteContent?.length ?? 0,
    projects: payload.projects?.length ?? 0,
    experience: payload.experience?.length ?? 0,
    research: payload.research?.length ?? 0,
    seo: payload.seo?.length ?? 0,
    system: payload.system?.length ?? 0,
  };

  const warnings: string[] = [];
  if (counts.projects === 0 && counts.research === 0 && counts.experience === 0) {
    warnings.push("No portfolio entities found in payload.");
  }

  if (dryRun) {
    await prisma.backupImportLog.create({
      data: {
        actorAdminId: session.userId,
        dryRun: true,
        importedCounts: counts as never,
        warnings: warnings as never,
      },
    });

    return NextResponse.json({ success: true, dryRun: true, counts, warnings });
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (payload.siteContent?.length) {
      await tx.siteContent.createMany({ data: payload.siteContent as never[], skipDuplicates: true });
    }
    if (payload.projects?.length) {
      await tx.project.createMany({ data: payload.projects as never[], skipDuplicates: true });
    }
    if (payload.experience?.length) {
      await tx.experience.createMany({ data: payload.experience as never[], skipDuplicates: true });
    }
    if (payload.research?.length) {
      await txResearchDelegate(tx).createMany({ data: payload.research as never[], skipDuplicates: true });
    }
    if (payload.seo?.length) {
      await tx.seoConfig.createMany({ data: payload.seo as never[], skipDuplicates: true });
    }
    if (payload.system?.length) {
      await tx.systemSetting.createMany({ data: payload.system as never[], skipDuplicates: true });
    }

    await tx.backupImportLog.create({
      data: {
        actorAdminId: session.userId,
        dryRun: false,
        importedCounts: counts as never,
        warnings: warnings as never,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.userId,
        actorAdminId: session.userId,
        action: "IMPORT",
        entityType: "Backup",
        entityId: "json",
        summary: "Imported backup data",
        resource: "Backup",
        resourceId: "json",
        metadata: { counts, warnings },
      },
    });
  });

  return NextResponse.json({ success: true, dryRun: false, counts, warnings });
}
