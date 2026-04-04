import { LabPageClient } from "@/components/lab/lab-page-client";
import { Container } from "@/components/layout/container";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
	title: "AI/ML Lab",
	description: "Interactive AI/ML demos, experiment logs, and notebook hub for live model exploration.",
	path: "/github",
});
export default function GitHubPage() {
	return (
		<Container className="py-16 md:py-24">
			<LabPageClient />
		</Container>
	);
}
