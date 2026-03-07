import { headers } from "next/headers";

import { GitHubDashboardTabs } from "@/components/github/GitHubDashboardTabs";
import { GitHubHero } from "@/components/github/GitHubHero";
import { Container } from "@/components/layout/container";
import { buildMetadata } from "@/lib/seo";
import type { GitHubDashboardResponse } from "@/types/github";

export const metadata = buildMetadata({
	title: "GitHub Dashboard",
	description: "Live GitHub activity dashboard showing contributions, pinned repositories, and recent engineering work.",
	path: "/github",
});

function getBaseUrlFromHeaders(headerStore: Headers) {
	const explicit = process.env.NEXT_PUBLIC_SITE_URL;
	if (explicit) {
		return explicit;
	}

	const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
	const proto = headerStore.get("x-forwarded-proto") ?? "http";

	if (!host) {
		return "https://www.example.com";
	}

	return `${proto}://${host}`;
}

async function getGitHubDashboardData() {
	const headerStore = await headers();
	const baseUrl = getBaseUrlFromHeaders(headerStore);

	const response = await fetch(`${baseUrl}/api/github`, {
		next: { revalidate: 60 },
	});

	if (!response.ok) {
		throw new Error("Failed to load GitHub dashboard data");
	}

	return (await response.json()) as GitHubDashboardResponse;
}

export default async function GitHubPage() {
	const dashboard = await getGitHubDashboardData();

	return (
		<Container className="space-y-8 py-16 md:py-24">
			<GitHubHero profile={dashboard.data.profile} />

			{dashboard.meta.warning ? (
				<div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
					{dashboard.meta.warning}
				</div>
			) : null}

			<GitHubDashboardTabs data={dashboard.data} />
		</Container>
	);
}
