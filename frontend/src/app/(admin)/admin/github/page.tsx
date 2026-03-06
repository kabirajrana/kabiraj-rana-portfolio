import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";

import { syncGithubNowAction, updateGithubSettingsAction } from "../actions";

export default async function AdminGithubPage() {
  const settings = await contentRepository.getGithubSettings();

  return (
    <section className="pb-8">
      <PageHeader title="GitHub Integration" description="Control GitHub dashboard syncing, cache policy, and pinned repo overrides." />
      <Card>
        <CardHeader>
          <CardTitle>GitHub Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateGithubSettingsAction} className="grid gap-2 md:grid-cols-2">
            <input name="githubUsername" defaultValue={settings?.githubUsername ?? ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="cacheRevalidateSeconds" defaultValue={String(settings?.cacheRevalidateSeconds ?? 900)} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="hiddenRepos" defaultValue={Array.isArray(settings?.hiddenRepos) ? settings.hiddenRepos.join(", ") : ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="pinnedOverrides" defaultValue={Array.isArray(settings?.pinnedOverrides) ? settings.pinnedOverrides.join(", ") : ""} className="rounded-xl border border-border bg-surface p-2.5" />
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5 md:col-span-2"><input type="checkbox" name="enableGitHubDashboard" defaultChecked={settings?.enableGitHubDashboard ?? true} />Enable GitHub Dashboard</label>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="submit">Save Settings</Button>
              <form action={syncGithubNowAction}>
                <Button type="submit" variant="outline">Sync Now</Button>
              </form>
            </div>
          </form>

          <div className="mt-4 rounded-xl border border-border/70 p-3 text-sm text-muted">
            <p>Last sync: {settings?.lastSyncAt?.toISOString() ?? "Never"}</p>
            <p>Last error: {settings?.lastError ?? "None"}</p>
            <p>Rate limit remaining: {settings?.rateLimitRemaining ?? "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
