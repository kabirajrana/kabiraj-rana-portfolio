"use client";

import { useMemo, useState } from "react";

import { ContributionCalendar } from "@/components/github/ContributionCalendar";
import { PinnedReposGrid } from "@/components/github/PinnedReposGrid";
import { RecentActivity } from "@/components/github/RecentActivity";
import { Button } from "@/components/ui/button";
import type { GitHubDashboardData } from "@/types/github";

const tabItems = ["Overview", "Repos", "Activity", "Contributions"] as const;

type TabItem = (typeof tabItems)[number];

export function GitHubDashboardTabs({ data }: { data: GitHubDashboardData }) {
	const [activeTab, setActiveTab] = useState<TabItem>("Overview");

	const content = useMemo(() => {
		if (activeTab === "Repos") {
			return <PinnedReposGrid repos={data.pinnedRepos} />;
		}

		if (activeTab === "Activity") {
			return <RecentActivity events={data.recentEvents} />;
		}

		if (activeTab === "Contributions") {
			return (
				<ContributionCalendar
					username={data.profile.login}
					initialYear={data.contributions.year}
					availableYears={data.contributions.availableYears}
					initialTotal={data.contributions.total}
					initialDays={data.contributions.days}
				/>
			);
		}

		return (
			<div className="space-y-8">
				<ContributionCalendar
					username={data.profile.login}
					initialYear={data.contributions.year}
					availableYears={data.contributions.availableYears}
					initialTotal={data.contributions.total}
					initialDays={data.contributions.days}
				/>
				<PinnedReposGrid repos={data.pinnedRepos} />
				<RecentActivity events={data.recentEvents} />
			</div>
		);
	}, [activeTab, data]);

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-border/70 bg-surface/45 p-3">
				<div className="flex flex-wrap gap-2">
					{tabItems.map((item) => (
						<Button
							key={item}
							type="button"
							size="sm"
							variant={activeTab === item ? "default" : "outline"}
							onClick={() => setActiveTab(item)}
						>
							{item}
						</Button>
					))}
				</div>
			</div>

			{content}
		</div>
	);
}
