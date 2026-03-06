import { PageHeader } from "@/components/admin/PageHeader";
import { contentRepository } from "@/lib/db/repositories";
import { SettingsForm } from "@/app/(admin)/admin/settings/settings-form";

export default async function AdminSettingsPage() {
  const settings = await contentRepository.getSystemSettings();

  return (
    <section className="pb-8">
      <PageHeader title="System Settings" description="Site identity, social links, theme tokens, and feature toggles." />
      <SettingsForm
        defaultValues={{
          siteName: settings?.siteName ?? "",
          primaryEmail: settings?.primaryEmail ?? "",
          locationText: settings?.locationText ?? "",
          responseTimeText: settings?.responseTimeText ?? "",
          availabilityEnabled: settings?.availabilityEnabled ?? true,
          availabilityHeadline: settings?.availabilityHeadline ?? "",
          availabilitySubtext: settings?.availabilitySubtext ?? "",
          githubUrl: settings?.githubUrl ?? String((settings?.socialLinks as Record<string, string> | null)?.github ?? ""),
          linkedinUrl: settings?.linkedinUrl ?? String((settings?.socialLinks as Record<string, string> | null)?.linkedin ?? ""),
          xUrl: settings?.xUrl ?? String((settings?.socialLinks as Record<string, string> | null)?.x ?? ""),
          accentColor: settings?.accentColor ?? "cyan",
          glowIntensity: settings?.glowIntensity ?? 0.5,
          borderRadiusScale: settings?.borderRadiusScale ?? 1,
          enableProjects: settings?.enableProjects ?? true,
          enableResearch: settings?.enableResearch ?? true,
          enableGitHub: settings?.enableGitHub ?? true,
          enableExperience: settings?.enableExperience ?? true,
          maintenanceMode: settings?.maintenanceMode ?? false,
        }}
      />
    </section>
  );
}
