"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import type { GitHubContributionDay, GitHubDashboardResponse } from "@/types/github";

type CalendarCell = {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
	weekday: number;
	inYear: boolean;
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

function levelClass(level: 0 | 1 | 2 | 3 | 4) {
	if (level === 0) return "bg-surface-2/70";
	if (level === 1) return "bg-emerald-900/55";
	if (level === 2) return "bg-emerald-700/65";
	if (level === 3) return "bg-emerald-500/75";
	return "bg-emerald-300/85";
}

function formatTooltipDate(date: string) {
	return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function toDateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

function buildCalendar(days: GitHubContributionDay[], year: number) {
	const dayMap = new Map<string, GitHubContributionDay>();
	for (const day of days) {
		dayMap.set(day.date, day);
	}

	const startOfYear = new Date(Date.UTC(year, 0, 1));
	const endOfYear = new Date(Date.UTC(year, 11, 31));

	const start = new Date(startOfYear);
	start.setUTCDate(start.getUTCDate() - start.getUTCDay());

	const end = new Date(endOfYear);
	end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

	const weeks: CalendarCell[][] = [];
	const monthStartIndex = new Map<number, number>();

	let weekIndex = -1;
	for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
		if (cursor.getUTCDay() === 0) {
			weeks.push([]);
			weekIndex += 1;
		}

		const date = toDateKey(cursor);
		const found = dayMap.get(date);
		const inYear = cursor.getUTCFullYear() === year;

		const cell: CalendarCell = {
			date,
			count: found?.count ?? 0,
			level: found?.level ?? 0,
			weekday: cursor.getUTCDay(),
			inYear,
		};

		weeks[weekIndex].push(cell);

		if (cursor.getUTCDate() === 1 && inYear && !monthStartIndex.has(cursor.getUTCMonth())) {
			monthStartIndex.set(cursor.getUTCMonth(), weekIndex);
		}
	}

	const monthMarkers = Array.from(monthStartIndex.entries())
		.sort((a, b) => a[1] - b[1])
		.map(([month, week]) => ({
			month,
			week,
			label: monthLabels[month] ?? "",
		}));

	return {
		weeks,
		monthMarkers,
	};
}

export function ContributionCalendar({
	username,
	initialYear,
	availableYears,
	initialTotal,
	initialDays,
}: {
	username: string;
	initialYear: number;
	availableYears: number[];
	initialTotal: number;
	initialDays: GitHubContributionDay[];
}) {
	const currentYear = new Date().getFullYear();
	const normalizedInitialYear = Number.isInteger(initialYear) ? initialYear : currentYear;
	const [selectedYear, setSelectedYear] = useState(normalizedInitialYear);
	const [total, setTotal] = useState(Number.isFinite(initialTotal) ? initialTotal : 0);
	const [days, setDays] = useState(initialDays);
	const [pending, startTransition] = useTransition();
	const safeTotal = Number.isFinite(total) ? total : 0;

	const { weeks, monthMarkers } = useMemo(() => {
		const safeDays = Array.isArray(days) ? days : [];
		return buildCalendar(safeDays, selectedYear);
	}, [days, selectedYear]);

	const sortedYears = useMemo(() => {
		const normalizedAvailableYears = Array.isArray(availableYears)
			? availableYears.filter((year): year is number => Number.isInteger(year) && year >= 2008 && year <= currentYear)
			: [];
		const safeAvailableYears = normalizedAvailableYears.length > 0 ? normalizedAvailableYears : [selectedYear, selectedYear - 1];
		return Array.from(new Set([...safeAvailableYears, selectedYear])).sort((a, b) => b - a);
	}, [availableYears, currentYear, selectedYear]);

	const loadYear = (year: number, options?: { forceRefresh?: boolean }) => {
		startTransition(async () => {
			const params = new URLSearchParams({ year: String(year) });
			if (options?.forceRefresh) {
				params.set("refresh", "1");
			}

			const response = await fetch(`/api/github?${params.toString()}`);
			if (!response.ok) {
				return;
			}

			const payload = (await response.json()) as GitHubDashboardResponse;
			const contributionData = payload.data?.contributions;
			if (!contributionData) {
				return;
			}

			const nextYear = Number.isInteger(contributionData.year) ? contributionData.year : year;
			const nextTotal = Number.isFinite(contributionData.total) ? contributionData.total : 0;

			setSelectedYear(nextYear);
			setTotal(nextTotal);
			setDays(Array.isArray(contributionData.days) ? contributionData.days : []);
		});
	};

	const onSelectYear = (year: number) => {
		if (year === selectedYear) {
			return;
		}

		loadYear(year, { forceRefresh: year === currentYear });
	};

	useEffect(() => {
		if (selectedYear !== currentYear) {
			return;
		}

		const id = window.setInterval(() => {
			loadYear(currentYear, { forceRefresh: true });
		}, 60000);

		return () => window.clearInterval(id);
	}, [selectedYear, currentYear]);

	return (
		<section className="rounded-xl border border-border/70 bg-surface/80 p-4 text-text sm:p-5">
			<div className="flex items-start justify-between gap-4">
				<div className="text-sm">
					<span className="font-medium text-text">{safeTotal} contributions</span> in {selectedYear}
				</div>
				<div className="flex items-start gap-4 text-xs">
					<span className="pt-1 text-muted">Contribution settings</span>
					<div className="flex flex-col items-end gap-1">
						{sortedYears.map((year) => (
							<button
								key={`year-${year}`}
								type="button"
								onClick={() => onSelectYear(year)}
								className={`rounded-full px-2.5 py-1 transition-colors ${
									year === selectedYear
										? "bg-accent text-white"
										: "text-muted hover:bg-surface-2 hover:text-text"
								}`}
							>
								{year}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="mt-4 overflow-x-auto pb-1">
				<div className="min-w-max">
					<div className="relative ml-8 h-4 text-[10px] text-muted">
						{monthMarkers.map((marker) => (
							<span
								key={`${marker.month}-${marker.week}`}
								className="absolute"
								style={{ left: `${marker.week * 15}px` }}
							>
								{marker.label}
							</span>
						))}
					</div>

					<div className="mt-1 flex gap-2">
						<div className="grid h-[84px] w-6 grid-rows-7 items-center text-[10px] text-muted">
							{dayLabels.map((label, index) => (
								<span key={`${label}-${index}`}>{label}</span>
							))}
						</div>

						<div className="relative grid grid-flow-col gap-[3px]">
							{weeks.map((week, weekIndex) => (
								<div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-[3px]">
									{week.map((cell) => (
										<button
											key={cell.date}
											type="button"
											onClick={() =>
												window.open(
													`https://github.com/${username}?tab=overview&from=${cell.date}&to=${cell.date}`,
													"_blank",
													"noopener,noreferrer"
												)
											}
											className={`group relative h-3 w-3 rounded-[2px] border border-black/10 ${
												cell.inYear ? levelClass(cell.level) : "bg-surface/30"
											} ${cell.inYear ? "hover:ring-1 hover:ring-border/70" : ""}`}
											aria-label={`${cell.count} contributions on ${formatTooltipDate(cell.date)}`}
										>
											<span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-2 px-2 py-1 text-[10px] text-text shadow-soft group-hover:block">
												{cell.count} contributions on {formatTooltipDate(cell.date)}
											</span>
										</button>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
				{pending ? <span className="mr-2">Updating…</span> : null}
				<span>Less</span>
				{([0, 1, 2, 3, 4] as const).map((level) => (
					<span key={level} className={`h-3 w-3 rounded-[2px] border border-black/10 ${levelClass(level)}`} />
				))}
				<span>More</span>
			</div>
		</section>
	);
}
