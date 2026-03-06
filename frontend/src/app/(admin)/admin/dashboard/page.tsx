import { format } from "date-fns";

import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardRepository } from "@/lib/db/repositories";
import { prisma } from "@/lib/db/prisma";

type ActivityItem = Awaited<ReturnType<typeof dashboardRepository.getRecentActivity>>[number];

export default async function AdminDashboardPage() {
  const [kpis, recentActivity, pageViews] = await Promise.all([
    dashboardRepository.getKpis(),
    dashboardRepository.getRecentActivity(),
    prisma.analyticsEvent.findMany({
      where: { eventType: "PAGE_VIEW" },
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: { path: true, createdAt: true },
    }),
  ]);

  const dailyMap = new Map<string, number>();
  for (const event of pageViews) {
    const key = format(event.createdAt, "MMM dd");
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  const topPageMap = new Map<string, number>();
  for (const event of pageViews) {
    topPageMap.set(event.path, (topPageMap.get(event.path) ?? 0) + 1);
  }

  const visitors = [...dailyMap.entries()].slice(-14).map(([date, count]) => ({ date, count }));
  const topPages = [...topPageMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([page, count]) => ({ page, count }));

  return (
    <section className="pb-8">
      <PageHeader title="Dashboard" description="Mission control for portfolio content, research pipeline, and growth signals." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Projects" value={kpis.projects} />
        <StatCard label="Research Posts" value={kpis.research} />
        <StatCard label="Experience Entries" value={kpis.experience} />
        <StatCard label="Unread Messages" value={kpis.unreadMessages} />
        <StatCard label="CV Downloads" value={kpis.cvDownloads} />
        <StatCard label="Visitors" value={`${kpis.visitors7d} / ${kpis.visitors30d}`} meta="7d / 30d" />
      </div>

      <div className="mt-4">
        <DashboardCharts visitors={visitors} topPages={topPages} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {recentActivity.length ? (
            recentActivity.map((item: ActivityItem) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <p>
                  <span className="font-medium">{item.actor?.name ?? item.actor?.email ?? "System"}</span> {item.action} {item.resource}
                </p>
                <p className="text-xs text-muted">{format(item.createdAt, "MMM d, HH:mm")}</p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-muted">No activity yet.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
