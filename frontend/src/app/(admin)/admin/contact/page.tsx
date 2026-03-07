import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentRepository } from "@/lib/db/repositories";

import { updateContactPageConfigAction } from "../actions";

export default async function AdminContactPage() {
  const config = await contentRepository.getContactPageConfig();
  const social = (config?.socialLinks as Record<string, unknown> | null) ?? {};

  return (
    <section className="pb-8">
      <PageHeader title="Contact Settings" description="Manage contact details, social links, and availability badge on public contact page." />

      <Card>
        <CardHeader>
          <CardTitle>Public Contact Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateContactPageConfigAction} className="grid gap-2 md:grid-cols-2">
            <input name="email" defaultValue={config?.email ?? "kabirajrana76@gmail.com"} placeholder="Public email" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="locationText" defaultValue={config?.locationText ?? ""} placeholder="Location text" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="responseTime" defaultValue={config?.responseTime ?? ""} placeholder="Response time" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="github" defaultValue={String(social.github ?? "https://github.com/kabirajrana")} placeholder="GitHub URL" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="linkedin" defaultValue={String(social.linkedin ?? "https://www.linkedin.com/in/kabirajrana/")} placeholder="LinkedIn URL" className="rounded-xl border border-border bg-surface p-2.5" />
            <input name="additionalLinks" defaultValue={Array.isArray(social.additional) ? social.additional.join(", ") : ""} placeholder="Additional links (comma-separated)" className="rounded-xl border border-border bg-surface p-2.5" />
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5 md:col-span-2"><input type="checkbox" name="availabilityEnabled" defaultChecked={config?.availabilityEnabled ?? true} />Availability badge enabled</label>
            <input name="availabilityHeadline" defaultValue={config?.availabilityHeadline ?? ""} placeholder="Availability headline" className="rounded-xl border border-border bg-surface p-2.5 md:col-span-2" />
            <textarea name="availabilitySubtext" defaultValue={config?.availabilitySubtext ?? ""} placeholder="Availability subtext" className="rounded-xl border border-border bg-surface p-2.5 md:col-span-2" />
            <Button type="submit" className="md:col-span-2">Save Contact Settings</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
