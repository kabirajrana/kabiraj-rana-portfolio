import "server-only";

import type { GitHubEvent } from "@/types/github";

function normalizeEnv(value: string | undefined): string {
	const trimmed = String(value ?? "").trim();
	if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
		return trimmed.slice(1, -1).trim();
	}
	return trimmed;
}

type GitHubPublicEvent = {
	id: string;
	type: string;
	repo: {
		name: string;
	};
	created_at: string;
	payload: {
		ref?: string;
		action?: string;
		release?: {
			html_url?: string;
			tag_name?: string;
		};
		pull_request?: {
			html_url?: string;
			title?: string;
		};
	};
};

function mapEventTitle(event: GitHubPublicEvent) {
	if (event.type === "PushEvent") {
		return "Pushed commits";
	}

	if (event.type === "PullRequestEvent") {
		return `${event.payload.action ?? "Updated"} pull request`;
	}

	if (event.type === "ReleaseEvent") {
		return "Published release";
	}

	if (event.type === "CreateEvent") {
		return "Created branch or tag";
	}

	return event.type.replace("Event", "");
}

function mapEventDescription(event: GitHubPublicEvent) {
	if (event.type === "PushEvent") {
		return event.payload.ref ? `Branch: ${event.payload.ref.replace("refs/heads/", "")}` : "Code push";
	}

	if (event.type === "PullRequestEvent") {
		return event.payload.pull_request?.title ?? "Pull request activity";
	}

	if (event.type === "ReleaseEvent") {
		return event.payload.release?.tag_name ? `Tag: ${event.payload.release.tag_name}` : "New release";
	}

	return event.repo.name;
}

function mapEventUrl(event: GitHubPublicEvent) {
	if (event.type === "PullRequestEvent" && event.payload.pull_request?.html_url) {
		return event.payload.pull_request.html_url;
	}

	if (event.type === "ReleaseEvent" && event.payload.release?.html_url) {
		return event.payload.release.html_url;
	}

	return `https://github.com/${event.repo.name}`;
}

export async function fetchGitHubRecentPublicEvents(options?: {
	revalidateSeconds?: number;
	forceFresh?: boolean;
	username?: string;
}): Promise<GitHubEvent[]> {
	const token = normalizeEnv(process.env.GITHUB_TOKEN);
	const username = normalizeEnv(options?.username) || normalizeEnv(process.env.GITHUB_USERNAME) || "kabirajrana";
	const revalidateSeconds = options?.revalidateSeconds ?? 90;

	const baseHeaders: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};

	const requestInit = options?.forceFresh ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } };

	const withTokenHeaders = token
		? {
				...baseHeaders,
				Authorization: `Bearer ${token}`,
		  }
		: baseHeaders;

	let response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=20`, {
		headers: withTokenHeaders,
		...requestInit,
	});

	// Invalid/expired PAT should not fully break public events; retry once without auth.
	if (token && response.status === 401) {
		console.warn("[github-rest] Authenticated events request returned 401; retrying without token", {
			username,
		});
		response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=20`, {
			headers: baseHeaders,
			...requestInit,
		});
	}

	if (!response.ok) {
		throw new Error(`GitHub REST failed with status ${response.status}`);
	}

	const events = (await response.json()) as GitHubPublicEvent[];

	return events.slice(0, 20).map((event) => ({
		id: event.id,
		type: event.type,
		title: mapEventTitle(event),
		description: mapEventDescription(event),
		repoName: event.repo.name,
		url: mapEventUrl(event),
		createdAt: event.created_at,
	}));
}
