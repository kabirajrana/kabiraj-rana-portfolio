import "server-only";

import type { GitHubContributionDay } from "@/types/github";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

function normalizeEnv(value: string | undefined): string {
	const trimmed = String(value ?? "").trim();
	if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
		return trimmed.slice(1, -1).trim();
	}
	return trimmed;
}

const CONTRIBUTIONS_QUERY = `
query ContributionsByYear($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`;

type ContributionsByYearResponse = {
	data?: {
		user: {
			contributionsCollection: {
				contributionCalendar: {
					totalContributions: number;
					weeks: Array<{
						contributionDays: Array<{
							date: string;
							contributionCount: number;
						}>;
					}>;
				};
			};
		};
	};
	errors?: Array<{ message: string }>;
};

async function fetchPublicContributionCalendar(
	username: string,
	year: number,
	options?: { revalidateSeconds?: number; forceFresh?: boolean }
): Promise<{
	year: number;
	total: number;
	days: GitHubContributionDay[];
}> {
	const revalidateSeconds = options?.revalidateSeconds ?? 120;
	const { start, end } = getYearBounds(year);
	const from = `${year}-01-01`;
	const to = `${year}-12-31`;

	const response = await fetch(`https://github.com/users/${username}/contributions?from=${from}&to=${to}`, {
		headers: {
			Accept: "image/svg+xml,text/html;q=0.9,*/*;q=0.8",
		},
		...(options?.forceFresh ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } }),
	});

	if (!response.ok) {
		throw new Error(`GitHub public contributions failed with status ${response.status}`);
	}

	const svg = await response.text();
	const rectPattern = /<rect\b[^>]*>/g;
	const datePattern = /data-date="([^"]+)"/;
	const countPattern = /data-count="(\d+)"/;
	const countByDate = new Map<string, number>();

	for (const rect of svg.match(rectPattern) ?? []) {
		const dateMatch = rect.match(datePattern);
		const countMatch = rect.match(countPattern);
		if (!dateMatch || !countMatch) {
			continue;
		}

		countByDate.set(dateMatch[1], Number(countMatch[1]));
	}

	if (countByDate.size === 0) {
		throw new Error("Failed to parse GitHub public contributions payload");
	}

	const maxCount = Math.max(0, ...Array.from(countByDate.values()));
	const days: GitHubContributionDay[] = [];
	let total = 0;

	for (const day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
		const date = toDateOnly(day);
		const count = countByDate.get(date) ?? 0;
		total += count;

		days.push({
			date,
			count,
			level: getLevelFromCount(count, maxCount),
			weekday: day.getUTCDay(),
		});
	}

	return {
		year,
		total,
		days,
	};
}

function toDateOnly(date: Date) {
	return date.toISOString().slice(0, 10);
}

function getYearBounds(year: number) {
	const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
	const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

	const start = new Date(startOfYear);
	start.setUTCDate(start.getUTCDate() - start.getUTCDay());

	const end = new Date(endOfYear);
	end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

	return {
		start,
		end,
		from: startOfYear.toISOString(),
		to: endOfYear.toISOString(),
	};
}

function getLevelFromCount(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
	if (count <= 0 || maxCount <= 0) {
		return 0;
	}

	const threshold1 = Math.max(1, Math.ceil(maxCount * 0.25));
	const threshold2 = Math.max(threshold1 + 1, Math.ceil(maxCount * 0.5));
	const threshold3 = Math.max(threshold2 + 1, Math.ceil(maxCount * 0.75));

	if (count <= threshold1) {
		return 1;
	}

	if (count <= threshold2) {
		return 2;
	}

	if (count <= threshold3) {
		return 3;
	}

	return 4;
}

export async function getContributionsByYear(username: string, year: number): Promise<{
	year: number;
	total: number;
	days: GitHubContributionDay[];
}> {
	return getContributionsByYearWithOptions(username, year);
}

export async function getContributionsByYearWithOptions(
	username: string,
	year: number,
	options?: {
		revalidateSeconds?: number;
		forceFresh?: boolean;
	}
): Promise<{
	year: number;
	total: number;
	days: GitHubContributionDay[];
}> {
	const token = process.env.GITHUB_TOKEN;
	const normalizedToken = normalizeEnv(token);
	const revalidateSeconds = options?.revalidateSeconds ?? 120;
	const { start, end, from, to } = getYearBounds(year);

	if (!normalizedToken) {
		console.warn("[github-contributions] GITHUB_TOKEN missing; falling back to public contributions scraping", {
			username,
			year,
		});
		return fetchPublicContributionCalendar(username, year, options);
	}

	const response = await fetch(GITHUB_GRAPHQL_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${normalizedToken}`,
		},
		...(options?.forceFresh ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } }),
		body: JSON.stringify({
			query: CONTRIBUTIONS_QUERY,
			variables: {
				login: username,
				from,
				to,
			},
		}),
	});

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			console.warn("[github-contributions] GraphQL auth failed; falling back to public contributions", {
				status: response.status,
				username,
				year,
			});
			return fetchPublicContributionCalendar(username, year, options);
		}

		throw new Error(`GitHub contribution query failed with status ${response.status}`);
	}

	const payload = (await response.json()) as ContributionsByYearResponse;

	if (payload.errors?.length) {
		const message = payload.errors.map((error) => error.message).join("; ");
		if (message.toLowerCase().includes("bad credentials")) {
			console.warn("[github-contributions] GraphQL bad credentials; falling back to public contributions", {
				username,
				year,
			});
			return fetchPublicContributionCalendar(username, year, options);
		}

		throw new Error(message);
	}

	if (!payload.data?.user) {
		throw new Error("GitHub contribution query returned no user");
	}

	const countByDate = new Map<string, number>();
	for (const week of payload.data.user.contributionsCollection.contributionCalendar.weeks) {
		for (const day of week.contributionDays) {
			countByDate.set(day.date, day.contributionCount);
		}
	}

	const maxCount = Math.max(0, ...Array.from(countByDate.values()));
	const days: GitHubContributionDay[] = [];

	for (const day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
		const date = toDateOnly(day);
		const count = countByDate.get(date) ?? 0;

		days.push({
			date,
			count,
			level: getLevelFromCount(count, maxCount),
			weekday: day.getUTCDay(),
		});
	}

	return {
		year,
		total: payload.data.user.contributionsCollection.contributionCalendar.totalContributions,
		days,
	};
}
