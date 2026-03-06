import { NextResponse } from "next/server";

import { getContributionsByYearWithOptions } from "@/lib/github/contributions";
import { fetchGitHubGraphQLDashboardDataWithOptions } from "@/lib/github/graphql";
import { fetchGitHubRecentPublicEvents } from "@/lib/github/rest";
import type { GitHubDashboardResponse } from "@/types/github";

export const revalidate = 60;

let lastKnownGoodSnapshot: GitHubDashboardResponse | null = null;

function createEmptyFallback(message: string): GitHubDashboardResponse {
	const username = process.env.GITHUB_USERNAME ?? "kabirajrana";
	const currentYear = new Date().getFullYear();

	return {
		data: {
			profile: {
				name: username,
				login: username,
				avatarUrl: `https://github.com/${username}.png`,
				bio: "GitHub data is temporarily unavailable.",
				followers: 0,
				following: 0,
				publicRepos: 0,
				url: `https://github.com/${username}`,
			},
			contributions: {
				year: currentYear,
				availableYears: [currentYear, currentYear - 1],
				total: 0,
				days: [],
			},
			pinnedRepos: [],
			recentEvents: [],
		},
		meta: {
			generatedAt: new Date().toISOString(),
			stale: true,
			warning: message,
		},
	};
}

function parseYear(searchParams: URLSearchParams) {
	const currentYear = new Date().getFullYear();
	const yearParam = searchParams.get("year");
	const parsedYear = yearParam ? Number(yearParam) : currentYear;

	if (!Number.isInteger(parsedYear) || parsedYear < 2008 || parsedYear > currentYear) {
		return currentYear;
	}

	return parsedYear;
}

export async function GET(request: Request) {
	try {
		const username = process.env.GITHUB_USERNAME ?? "kabirajrana";
		const currentYear = new Date().getFullYear();
		const searchParams = new URL(request.url).searchParams;
		const selectedYear = parseYear(searchParams);
		const forceRefresh = searchParams.get("refresh") === "1";
		const isCurrentYear = selectedYear === currentYear;
		const contributionRevalidate = isCurrentYear ? 60 : 3600;
		const eventsRevalidate = isCurrentYear ? 45 : 300;
		const profileRevalidate = isCurrentYear ? 180 : 900;

		const [graphqlData, recentEvents, contributions] = await Promise.all([
			fetchGitHubGraphQLDashboardDataWithOptions({
				revalidateSeconds: profileRevalidate,
				forceFresh: forceRefresh,
			}),
			fetchGitHubRecentPublicEvents({
				revalidateSeconds: eventsRevalidate,
				forceFresh: forceRefresh && isCurrentYear,
			}),
			getContributionsByYearWithOptions(username, selectedYear, {
				revalidateSeconds: contributionRevalidate,
				forceFresh: forceRefresh,
			}),
		]);

		const response: GitHubDashboardResponse = {
			data: {
				...graphqlData,
				contributions: {
					year: contributions.year,
					availableYears: [currentYear, currentYear - 1],
					total: contributions.total,
					days: contributions.days,
				},
				recentEvents,
			},
			meta: {
				generatedAt: new Date().toISOString(),
				stale: false,
			},
		};

		lastKnownGoodSnapshot = response;

		return NextResponse.json(response, {
			status: 200,
			headers: {
				"Cache-Control": forceRefresh
					? "no-store"
					: isCurrentYear
						? "s-maxage=60, stale-while-revalidate=180"
						: "s-maxage=900, stale-while-revalidate=1800",
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "GitHub service unavailable";

		if (lastKnownGoodSnapshot) {
			return NextResponse.json(
				{
					...lastKnownGoodSnapshot,
					meta: {
						...lastKnownGoodSnapshot.meta,
						stale: true,
						warning: `Using last known GitHub snapshot: ${message}`,
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "s-maxage=600, stale-while-revalidate=1200",
					},
				}
			);
		}

		return NextResponse.json(createEmptyFallback(`GitHub data temporarily unavailable: ${message}`), {
			status: 200,
			headers: {
				"Cache-Control": "s-maxage=300, stale-while-revalidate=900",
			},
		});
	}
}
