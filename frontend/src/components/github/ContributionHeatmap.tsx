"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GitHubContributionDay } from "@/types/github";

function levelClass(level: GitHubContributionDay["level"]) {
	if (level === 0) return "bg-surface-2/60";
	if (level === 1) return "bg-emerald-900/55";
	if (level === 2) return "bg-emerald-700/65";
	if (level === 3) return "bg-emerald-500/75";
	return "bg-emerald-300/85";
}

function formatDate(date: string) {
	return new Date(date).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function ContributionHeatmap({ days, total }: { days: GitHubContributionDay[]; total: number }) {
	const [hovered, setHovered] = useState<GitHubContributionDay | null>(null);

	const sortedDays = useMemo(() => [...days].sort((a, b) => +new Date(a.date) - +new Date(b.date)), [days]);

	return (
		<Card className="border-border/70 bg-[linear-gradient(145deg,hsl(var(--surface)/0.8)_0%,hsl(var(--background)/0.9)_100%)]">
			<CardHeader className="pb-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted">Last 365 Days</p>
						<CardTitle className="mt-1 text-xl">Contribution Calendar</CardTitle>
					</div>
					<p className="text-sm text-muted">
						<span className="font-semibold text-text">{total}</span> total contributions
					</p>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div
					role="grid"
					aria-label="GitHub contribution heatmap"
					className="overflow-x-auto rounded-xl border border-border/70 bg-background/35 p-3"
				>
					<div className="grid min-w-max grid-flow-col grid-rows-7 gap-1">
						{sortedDays.map((day) => (
							<button
								key={day.date}
								type="button"
								role="gridcell"
								title={`${formatDate(day.date)}: ${day.count} contributions`}
								onMouseEnter={() => setHovered(day)}
								onFocus={() => setHovered(day)}
								onMouseLeave={() => setHovered(null)}
								onBlur={() => setHovered(null)}
								className={`h-3.5 w-3.5 rounded-[3px] border border-border/35 transition-transform duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${levelClass(day.level)}`}
								aria-label={`${formatDate(day.date)} ${day.count} contributions`}
							/>
						))}
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
					<p>{hovered ? `${formatDate(hovered.date)} · ${hovered.count} contribution(s)` : "Hover any cell for details"}</p>
					<div className="inline-flex items-center gap-1.5">
						<span>Low</span>
						{([0, 1, 2, 3, 4] as const).map((level) => (
							<span key={level} className={`h-3 w-3 rounded-[3px] border border-border/40 ${levelClass(level)}`} />
						))}
						<span>High</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
