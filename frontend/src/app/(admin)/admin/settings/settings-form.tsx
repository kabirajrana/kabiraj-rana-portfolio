"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { disablePreviewAction, enablePreviewAction, updateSystemSettingsAction } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SettingsData = {
  siteName: string;
  primaryEmail: string;
  locationText: string;
  responseTimeText: string;
  availabilityEnabled: boolean;
  availabilityHeadline: string;
  availabilitySubtext: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl: string;
  accentColor: string;
  glowIntensity: number;
  borderRadiusScale: number;
  enableProjects: boolean;
  enableResearch: boolean;
  enableGitHub: boolean;
  enableExperience: boolean;
  maintenanceMode: boolean;
};

export function SettingsForm({ defaultValues }: { defaultValues: SettingsData }) {
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(defaultValues);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(defaultValues), [defaultValues, values]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function setField<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          await updateSystemSettingsAction(formData);
          toast.success("System settings saved");
        });
      }}
    >
      <Card>
        <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <input name="siteName" value={values.siteName} onChange={(event) => setField("siteName", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Site name" />
          <input name="primaryEmail" value={values.primaryEmail} onChange={(event) => setField("primaryEmail", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Primary email" />
          <input name="locationText" value={values.locationText} onChange={(event) => setField("locationText", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Location text" />
          <input name="responseTimeText" value={values.responseTimeText} onChange={(event) => setField("responseTimeText", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Response time" />
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5 md:col-span-2"><input type="checkbox" name="availabilityEnabled" checked={values.availabilityEnabled} onChange={(event) => setField("availabilityEnabled", event.target.checked)} />Availability enabled</label>
          <input name="availabilityHeadline" value={values.availabilityHeadline} onChange={(event) => setField("availabilityHeadline", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Availability headline" />
          <input name="availabilitySubtext" value={values.availabilitySubtext} onChange={(event) => setField("availabilitySubtext", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Availability subtext" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Social + Theme</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <input name="githubUrl" value={values.githubUrl} onChange={(event) => setField("githubUrl", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="GitHub URL" />
          <input name="linkedinUrl" value={values.linkedinUrl} onChange={(event) => setField("linkedinUrl", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="LinkedIn URL" />
          <input name="xUrl" value={values.xUrl} onChange={(event) => setField("xUrl", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="X URL" />
          <input name="accentColor" value={values.accentColor} onChange={(event) => setField("accentColor", event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Accent color token" />
          <input name="glowIntensity" type="number" step="0.1" value={values.glowIntensity} onChange={(event) => setField("glowIntensity", Number(event.target.value))} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Glow intensity" />
          <input name="borderRadiusScale" type="number" step="0.1" value={values.borderRadiusScale} onChange={(event) => setField("borderRadiusScale", Number(event.target.value))} className="rounded-xl border border-border bg-surface p-2.5" placeholder="Border radius scale" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Feature Toggles</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"><input type="checkbox" name="enableProjects" checked={values.enableProjects} onChange={(event) => setField("enableProjects", event.target.checked)} />Enable projects</label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"><input type="checkbox" name="enableResearch" checked={values.enableResearch} onChange={(event) => setField("enableResearch", event.target.checked)} />Enable research</label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"><input type="checkbox" name="enableGitHub" checked={values.enableGitHub} onChange={(event) => setField("enableGitHub", event.target.checked)} />Enable GitHub</label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"><input type="checkbox" name="enableExperience" checked={values.enableExperience} onChange={(event) => setField("enableExperience", event.target.checked)} />Enable experience</label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5 md:col-span-2"><input type="checkbox" name="maintenanceMode" checked={values.maintenanceMode} onChange={(event) => setField("maintenanceMode", event.target.checked)} />Maintenance mode</label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Admin Utilities</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => startTransition(async () => { await enablePreviewAction(); toast.success("Preview mode enabled"); })}>Enable Preview</Button>
          <Button type="button" variant="outline" onClick={() => startTransition(async () => { await disablePreviewAction(); toast.success("Preview mode disabled"); })}>Disable Preview</Button>
          <Button asChild type="button" variant="outline"><Link href="/admin/audit">Open Audit</Link></Button>
          <Button asChild type="button" variant="outline"><Link href="/admin/health">Open Health</Link></Button>
          <Button asChild type="button" variant="outline"><Link href="/admin/backup">Open Backup</Link></Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{dirty ? "You have unsaved changes" : "All changes saved"}</p>
        <Button type="submit" disabled={pending || !dirty}>{pending ? "Saving..." : "Save Settings"}</Button>
      </div>
    </form>
  );
}
