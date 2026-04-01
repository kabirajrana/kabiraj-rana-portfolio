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

type ParsedContributionRow = {
	date: string;
	count: number;
};

function parseNumber(value: string | undefined): number | null {
	if (!value) {
		return null;
	}
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		return null;
	}
	return parsed;
}

function parseDateFromTooltipOrAria(raw: string): string | null {
	const dateMatch = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
	if (dateMatch?.[1]) {
		return dateMatch[1];
	}

	const readableDateMatch = raw.match(/on\s+([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i);
	if (!readableDateMatch?.[1]) {
		return null;
	}

	const parsed = new Date(readableDateMatch[1]);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}

	return parsed.toISOString().slice(0, 10);
}

function parseCountFromTooltipOrAria(raw: string): number | null {
	const countMatch = raw.match(/\b(\d+)\s+contribution/i);
	return parseNumber(countMatch?.[1]);
}

function parseContributionRowsFromPayload(payload: string): ParsedContributionRow[] {
	const rows: ParsedContributionRow[] = [];

	// Current GitHub HTML grid cells expose contribution metadata in <td ... data-date data-level ...>.
	for (const cell of payload.match(/<td\b[^>]*data-date="[^"]+"[^>]*>/g) ?? []) {
		const dateMatch = cell.match(/data-date="([^"]+)"/);
		if (!dateMatch?.[1]) {
			continue;
		}

		const count =
			parseNumber(cell.match(/data-count="(\d+)"/)?.[1]) ??
			parseNumber(cell.match(/title="(\d+)\s+contribution/)?.[1]) ??
			parseNumber(cell.match(/aria-label="(\d+)\s+contribution/)?.[1]) ??
			parseNumber(cell.match(/data-level="(\d+)"/)?.[1]);

		if (count === null) {
			continue;
		}

		rows.push({ date: dateMatch[1], count });
	}

	// SVG variant used by /users/:username/contributions where rects may have data-count or only data-level.
	for (const rect of payload.match(/<rect\b[^>]*>/g) ?? []) {
		const dateMatch = rect.match(/data-date="([^"]+)"/);
		if (!dateMatch?.[1]) {
			continue;
		}

		const count =
			parseNumber(rect.match(/data-count="(\d+)"/)?.[1]) ??
			parseNumber(rect.match(/aria-label="(\d+)\s+contribution/)?.[1]) ??
			parseNumber(rect.match(/data-level="(\d+)"/)?.[1]);

		if (count === null) {
			continue;
		}

		rows.push({ date: dateMatch[1], count });
	}

	// HTML fallback variant where contribution data appears in tooltip/text blocks.
	for (const tooltip of payload.match(/<(?:tool-tip|td)\b[^>]*>[\s\S]*?<\/(?:tool-tip|td)>/g) ?? []) {
		const normalizedText = tooltip.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
		if (!normalizedText) {
			continue;
		}

		const date = parseDateFromTooltipOrAria(normalizedText);
		const count = parseCountFromTooltipOrAria(normalizedText);
		if (!date || count === null) {
			continue;
		}

		rows.push({ date, count });
	}

	return rows;
}

function parseContributionTotalFromPayload(payload: string, year: number): number | null {
	const escapedYear = String(year).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const yearRegex = new RegExp(`([\\d,]+)\\s+contributions?\\s+in\\s+${escapedYear}`, "i");
	const directMatch = payload.match(yearRegex);
	if (directMatch?.[1]) {
		return parseNumber(directMatch[1].replace(/,/g, ""));
	}

	const normalized = payload.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
	const textMatch = normalized.match(yearRegex);
	if (textMatch?.[1]) {
		return parseNumber(textMatch[1].replace(/,/g, ""));
	}

	return null;
}

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
		console.error("[github-contributions] Public contributions request failed", {
			mode: "public-scrape",
			username,
			year,
			status: response.status,
			contentType: response.headers.get("content-type") ?? "unknown",
		});
		throw new Error(`GitHub public contributions failed with status ${response.status}`);
	}

	const svg = await response.text();
	const countByDate = new Map<string, number>();
	for (const row of parseContributionRowsFromPayload(svg)) {
		countByDate.set(row.date, row.count);
	}

	if (countByDate.size === 0) {
		console.error("[github-contributions] Public contributions parsing failed", {
			mode: "public-scrape",
			username,
			year,
			contentType: response.headers.get("content-type") ?? "unknown",
			payloadLength: svg.length,
			payloadHead: svg.slice(0, 240),
		});
		throw new Error("Failed to parse GitHub public contributions payload");
	}

	console.info("[github-contributions] Parsed public contributions payload", {
		mode: "public-scrape",
		username,
		year,
		contentType: response.headers.get("content-type") ?? "unknown",
		parsedDays: countByDate.size,
	});

	const maxCount = Math.max(0, ...Array.from(countByDate.values()));
	const days: GitHubContributionDay[] = [];
	let computedTotal = 0;

	for (const day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
		const date = toDateOnly(day);
		const count = countByDate.get(date) ?? 0;
		computedTotal += count;

		days.push({
			date,
			count,
			level: getLevelFromCount(count, maxCount),
			weekday: day.getUTCDay(),
		});
	}

	const parsedTotal = parseContributionTotalFromPayload(svg, year);

	return {
		year,
		total: parsedTotal ?? computedTotal,
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
			mode: "public-scrape",
			username,
			year,
		});
		return fetchPublicContributionCalendar(username, year, options);
	}

	console.info("[github-contributions] Using authenticated GraphQL contribution query", {
		mode: "graphql-auth",
		username,
		year,
	});

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
				mode: "graphql-auth",
				status: response.status,
				contentType: response.headers.get("content-type") ?? "unknown",
				username,
				year,
			});
			return fetchPublicContributionCalendar(username, year, options);
		}

		console.error("[github-contributions] GraphQL contribution request failed", {
			mode: "graphql-auth",
			status: response.status,
			contentType: response.headers.get("content-type") ?? "unknown",
			username,
			year,
		});
		throw new Error(`GitHub contribution query failed with status ${response.status}`);
	}

	const payload = (await response.json()) as ContributionsByYearResponse;

	if (payload.errors?.length) {
		const message = payload.errors.map((error) => error.message).join("; ");
		if (message.toLowerCase().includes("bad credentials")) {
			console.warn("[github-contributions] GraphQL bad credentials; falling back to public contributions", {
				mode: "graphql-auth",
				username,
				year,
			});
			return fetchPublicContributionCalendar(username, year, options);
		}

		console.error("[github-contributions] GraphQL payload returned errors", {
			mode: "graphql-auth",
			username,
			year,
			message,
		});

		throw new Error(message);
	}

	if (!payload.data?.user) {
		console.error("[github-contributions] GraphQL payload missing user", {
			mode: "graphql-auth",
			username,
			year,
		});
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
