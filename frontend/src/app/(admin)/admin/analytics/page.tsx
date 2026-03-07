import { format } from "date-fns";

import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsOverview } from "@/lib/analytics/events";

type AnalyticsEventRow = {
  id: string;
  eventType: string;
  path: string;
  referrer: string | null;
  createdAt: Date;
};

export default async function AdminAnalyticsPage() {
  const events = (await getAnalyticsOverview(90)).slice(-2000) as AnalyticsEventRow[];

  const topReferrers = Object.entries(
    events.reduce<Record<string, number>>((acc, event) => {
      const key = event.referrer || "direct";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topPages = Object.entries(
    events.reduce<Record<string, number>>((acc, event) => {
      acc[event.path] = (acc[event.path] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <section className="pb-8">
      <PageHeader title="Analytics" description="Event insights for page views, referrals, devices, and high-intent actions." />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {topReferrers.map(([referrer, count]) => (
              <div key={referrer} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <span className="truncate">{referrer}</span>
                <span>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {topPages.map(([path, count]) => (
              <div key={path} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <span>{path}</span>
                <span>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {events.slice(0, 20).map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
              <p>{event.eventType} · {event.path}</p>
              <p className="text-xs text-muted">{format(event.createdAt, "MMM d, HH:mm")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
