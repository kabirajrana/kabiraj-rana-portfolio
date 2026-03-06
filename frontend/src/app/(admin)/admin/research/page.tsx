import { PageHeader } from "@/components/admin/PageHeader";
import { contentRepository } from "@/lib/db/repositories";
import { mapResearchEntry } from "@/lib/research/mappers";

import { ResearchAdminClient } from "@/app/(admin)/admin/research/research-admin-client";

export default async function AdminResearchPage() {
  const entries = await contentRepository.listResearch();
  const mappedEntries = (entries as unknown[]).map((entry) => mapResearchEntry(entry as never));

  return (
    <section className="pb-8">
      <PageHeader
        title="Research Lab Publishing"
        description="Manage publications, experiments, systems, thesis outputs, and technical notes with structured metadata."
      />
      <ResearchAdminClient entries={mappedEntries} />
    </section>
  );
}
