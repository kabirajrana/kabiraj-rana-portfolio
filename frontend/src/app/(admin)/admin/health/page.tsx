import Link from "next/link";

import { runHealthCheckAction } from "@/app/(admin)/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function AdminHealthPage() {
  const latest = await prisma.healthReport.findFirst({ orderBy: { createdAt: "desc" } });
  const checks = (latest?.checks as Array<{ key: string; level: "ok" | "warning" | "error"; message: string; count: number; href?: string }> | null) ?? [];

  return (
    <section className="space-y-4 pb-8">
      <PageHeader title="Data Health" description="Run integrity checks across links, SEO, images, and publication state." />

      <Card>
        <CardHeader>
          <CardTitle>Health Runner</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <form action={runHealthCheckAction}>
            <Button type="submit">Run Now</Button>
          </form>
          <Badge>Last run: {latest?.createdAt ? latest.createdAt.toLocaleString() : "Never"}</Badge>
          <Badge>{latest?.summary ?? "No report yet"}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {checks.length ? (
          checks.map((item) => (
            <Card key={item.key}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{item.key}</p>
                  <p className="text-sm text-muted">{item.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{item.level.toUpperCase()}</Badge>
                  {item.href ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={item.href}>Fix</Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted">No health report yet.</CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
