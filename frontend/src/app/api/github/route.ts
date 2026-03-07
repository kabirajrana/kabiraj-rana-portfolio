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

function toFriendlyGitHubErrorMessage(error: unknown) {
	const message = error instanceof Error ? error.message : "GitHub service unavailable";
	const normalized = message.toLowerCase();

	if (normalized.includes("401") || normalized.includes("bad credentials") || normalized.includes("missing github_token")) {
		return "GitHub authentication failed. Update GITHUB_TOKEN in your environment variables.";
	}

	return message;
}

function createProfileFallback(username: string) {
	return {
		name: username,
		login: username,
		avatarUrl: `https://github.com/${username}.png`,
		bio: "GitHub profile data is temporarily unavailable.",
		followers: 0,
		following: 0,
		publicRepos: 0,
		url: `https://github.com/${username}`,
	};
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

		const [graphqlDataResult, recentEventsResult, contributionsResult] = await Promise.allSettled([
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

		const warnings: string[] = [];

		const profileAndRepos =
			graphqlDataResult.status === "fulfilled"
				? graphqlDataResult.value
				: (() => {
					warnings.push(toFriendlyGitHubErrorMessage(graphqlDataResult.reason));
					return {
						profile: createProfileFallback(username),
						pinnedRepos: [],
					};
				  })();

		const contributions =
			contributionsResult.status === "fulfilled"
				? contributionsResult.value
				: (() => {
					warnings.push(toFriendlyGitHubErrorMessage(contributionsResult.reason));
					return {
						year: selectedYear,
						total: 0,
						days: [],
					};
				  })();

		const recentEvents =
			recentEventsResult.status === "fulfilled"
				? recentEventsResult.value
				: (() => {
					warnings.push(toFriendlyGitHubErrorMessage(recentEventsResult.reason));
					return [];
				  })();

		const allFailed =
			graphqlDataResult.status === "rejected" &&
			recentEventsResult.status === "rejected" &&
			contributionsResult.status === "rejected";

		if (allFailed && lastKnownGoodSnapshot) {
			return NextResponse.json(
				{
					...lastKnownGoodSnapshot,
					meta: {
						...lastKnownGoodSnapshot.meta,
						stale: true,
						warning: `Using last known GitHub snapshot: ${warnings[0] ?? "GitHub service unavailable"}`,
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

		const response: GitHubDashboardResponse = {
			data: {
				...profileAndRepos,
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
				stale: warnings.length > 0,
				...(warnings.length > 0 ? { warning: `GitHub data partially unavailable: ${warnings[0]}` } : {}),
			},
		};

		if (!response.meta.stale) {
			lastKnownGoodSnapshot = response;
		}

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
		const message = toFriendlyGitHubErrorMessage(error);

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
