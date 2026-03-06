import "server-only";

import type { GitHubEvent } from "@/types/github";

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
}): Promise<GitHubEvent[]> {
	const token = process.env.GITHUB_TOKEN;
	const username = process.env.GITHUB_USERNAME ?? "kabirajrana";
	const revalidateSeconds = options?.revalidateSeconds ?? 90;

	if (!token) {
		throw new Error("Missing GITHUB_TOKEN");
	}

	const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=20`, {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
		...(options?.forceFresh ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } }),
	});

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
