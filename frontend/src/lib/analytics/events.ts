import { backendApiRequest } from "@/lib/backend-api";

type AnalyticsEventType = "PAGE_VIEW" | "PROJECT_VIEW" | "GITHUB_CLICK" | "RESUME_DOWNLOAD" | "CONTACT_SUBMIT";

export async function trackEvent(input: {
  eventType: AnalyticsEventType;
  path: string;
  referrer?: string | null;
  device?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await backendApiRequest("/v1/analytics/events", {
    method: "POST",
    body: JSON.stringify({
      eventType: input.eventType,
      path: input.path,
      referrer: input.referrer ?? null,
      device: input.device ?? null,
      metadata: input.metadata ?? null,
    }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
}

export async function getAnalyticsOverview(days = 30) {
  const response = await backendApiRequest<Array<{ eventType: string; path: string; referrer: string | null; device: string | null; createdAt: string | Date; id?: string }>>(
    `/v1/analytics/events?days=${encodeURIComponent(String(days))}`,
    { method: "GET" },
  );

  if (!response) {
    return [];
  }

  return response.map((event, index) => ({
    ...event,
    id: event.id ?? `event-${index}`,
    createdAt: event.createdAt instanceof Date ? event.createdAt : new Date(event.createdAt),
  }));
}
