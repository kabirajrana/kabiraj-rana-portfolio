import { prisma } from "@/lib/db/prisma";

type AnalyticsEventType = "PAGE_VIEW" | "PROJECT_VIEW" | "GITHUB_CLICK" | "RESUME_DOWNLOAD" | "CONTACT_SUBMIT";

export async function trackEvent(input: {
  eventType: AnalyticsEventType;
  path: string;
  referrer?: string | null;
  device?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.analyticsEvent.create({
    data: {
      eventType: input.eventType,
      path: input.path,
      referrer: input.referrer ?? null,
      device: input.device ?? null,
      metadata: (input.metadata ?? null) as never,
    },
  });
}

export async function getAnalyticsOverview(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { eventType: true, path: true, referrer: true, device: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return events;
}
