import { LabPageClient } from "@/components/lab/lab-page-client";
import { Container } from "@/components/layout/container";
import { contentRepository } from "@/lib/db/repositories";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
	title: "AI/ML Lab",
	description: "Interactive AI/ML demos, experiment logs, and notebook hub for live model exploration.",
	path: "/github",
});

export const dynamic = "force-dynamic";

export default async function GitHubPage() {
	const settings = (await contentRepository.getGithubSettings()) ?? {};
	const labContent =
		settings.labContent && typeof settings.labContent === "object"
			? (settings.labContent as { experiments?: Array<Record<string, unknown>>; notebooks?: Array<Record<string, unknown>> })
			: undefined;

	return (
		<Container className="py-16 md:py-24">
			<LabPageClient initialData={labContent} />
		</Container>
	);
}
