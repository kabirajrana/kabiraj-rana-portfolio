import { Container } from "@/components/layout/container";
import { contentRepository } from "@/lib/db/repositories";
import { ResearchClientPage } from "@/app/research/research-client";
import { mapResearchEntry } from "@/lib/research/mappers";
import type { PublicResearchEntry } from "@/types/research";

export default async function ResearchPage() {
	const entries = await contentRepository.listResearch({ status: "PUBLISHED" });

	const mappedEntries: PublicResearchEntry[] = entries.map((entry) => mapResearchEntry(entry as never));

	return (
		<Container className="py-16 md:py-24">
			<ResearchClientPage entries={mappedEntries} />
		</Container>
	);
}
