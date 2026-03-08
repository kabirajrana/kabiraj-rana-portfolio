"use client";

import { useMemo, useState } from "react";

import { ContributionCalendar } from "@/components/github/ContributionCalendar";
import { PinnedReposGrid } from "@/components/github/PinnedReposGrid";
import { RecentActivity } from "@/components/github/RecentActivity";
import { Button } from "@/components/ui/button";
import type { GitHubDashboardData } from "@/types/github";

const tabItems = ["Overview", "Repos", "Activity", "Contributions"] as const;

type TabItem = (typeof tabItems)[number];

function hasValidContributions(days: GitHubDashboardData["contributions"]["days"]) {
	if (!Array.isArray(days) || days.length === 0) {
		return false;
	}

	return days.some((day) => {
		if (!day || typeof day !== "object") {
			return false;
		}

		const hasValidDate = typeof day.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day.date);
		const hasValidCount = Number.isFinite(day.count);
		const hasValidWeekday = Number.isInteger(day.weekday) && day.weekday >= 0 && day.weekday <= 6;
		const hasValidLevel = Number.isInteger(day.level) && day.level >= 0 && day.level <= 4;

		return hasValidDate && hasValidCount && hasValidWeekday && hasValidLevel;
	});
}

function renderContributionUnavailableNotice() {
	return (
		<div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
			Contributions data is temporarily unavailable. Profile, repositories, and activity are still live.
		</div>
	);
}

export function GitHubDashboardTabs({ data }: { data: GitHubDashboardData }) {
	const [activeTab, setActiveTab] = useState<TabItem>("Overview");
	const canRenderContributions = hasValidContributions(data.contributions.days);

	const content = useMemo(() => {
		if (activeTab === "Repos") {
			return <PinnedReposGrid repos={data.pinnedRepos} />;
		}

		if (activeTab === "Activity") {
			return <RecentActivity events={data.recentEvents} />;
		}

		if (activeTab === "Contributions") {
			if (!canRenderContributions) {
				return renderContributionUnavailableNotice();
			}

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
				{canRenderContributions ? (
					<ContributionCalendar
						username={data.profile.login}
						initialYear={data.contributions.year}
						availableYears={data.contributions.availableYears}
						initialTotal={data.contributions.total}
						initialDays={data.contributions.days}
					/>
				) : (
					renderContributionUnavailableNotice()
				)}
				<PinnedReposGrid repos={data.pinnedRepos} />
				<RecentActivity events={data.recentEvents} />
			</div>
		);
	}, [activeTab, canRenderContributions, data]);

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
