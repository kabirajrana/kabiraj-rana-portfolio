import "server-only";

import type {
	GitHubDashboardData,
	GitHubPinnedRepo,
	GitHubProfile,
} from "@/types/github";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

function normalizeEnv(value: string | undefined): string {
	const trimmed = String(value ?? "").trim();
	if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
		return trimmed.slice(1, -1).trim();
	}
	return trimmed;
}

const DASHBOARD_QUERY = `
query GitHubDashboard($login: String!) {
  user(login: $login) {
    name
    login
    avatarUrl
    bio
    url
    followers {
      totalCount
    }
    following {
      totalCount
    }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC) {
      totalCount
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          updatedAt
          primaryLanguage {
            name
            color
          }
          repositoryTopics(first: 8) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
}
`;

type GitHubGraphQLResponse = {
	data?: {
		user: {
			name: string | null;
			login: string;
			avatarUrl: string;
			bio: string | null;
			url: string;
			followers: { totalCount: number };
			following: { totalCount: number };
			repositories: { totalCount: number };
			pinnedItems: {
				nodes: Array<{
					name: string;
					description: string | null;
					url: string;
					stargazerCount: number;
					forkCount: number;
					updatedAt: string;
					primaryLanguage: { name: string; color: string | null } | null;
					repositoryTopics: {
						nodes: Array<{ topic: { name: string } }>;
					};
				}>;
			};
		};
	};
	errors?: Array<{ message: string }>;
};

type GitHubUserResponse = {
	name: string | null;
	login: string;
	avatar_url: string;
	bio: string | null;
	html_url: string;
	followers: number;
	following: number;
	public_repos: number;
};

type GitHubRepoResponse = {
	name: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	forks_count: number;
	updated_at: string;
	language: string | null;
	topics?: string[];
	pinned?: boolean;
};

async function fetchGitHubPublicProfileAndRepos(
	username: string,
	options?: { revalidateSeconds?: number; forceFresh?: boolean }
): Promise<Pick<GitHubDashboardData, "profile" | "pinnedRepos">> {
	const revalidateSeconds = options?.revalidateSeconds ?? 300;
	const requestInit = options?.forceFresh ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } };

	const [userResponse, reposResponse] = await Promise.all([
		fetch(`https://api.github.com/users/${username}`, {
			headers: {
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
			...requestInit,
		}),
		fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
			headers: {
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
			...requestInit,
		}),
	]);

	if (!userResponse.ok) {
		throw new Error(`GitHub user endpoint failed with status ${userResponse.status}`);
	}

	if (!reposResponse.ok) {
		throw new Error(`GitHub repos endpoint failed with status ${reposResponse.status}`);
	}

	const user = (await userResponse.json()) as GitHubUserResponse;
	const repos = (await reposResponse.json()) as GitHubRepoResponse[];

	const profile: GitHubProfile = {
		name: user.name ?? user.login,
		login: user.login,
		avatarUrl: user.avatar_url,
		bio: user.bio ?? "",
		followers: user.followers,
		following: user.following,
		publicRepos: user.public_repos,
		url: user.html_url,
	};

	const pinnedRepos: GitHubPinnedRepo[] = repos
		.filter((repo) => !repo.pinned)
		.sort((a, b) => {
			const starDiff = b.stargazers_count - a.stargazers_count;
			if (starDiff !== 0) {
				return starDiff;
			}

			return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
		})
		.slice(0, 6)
		.map((repo) => ({
			name: repo.name,
			description: repo.description ?? "No description available.",
			url: repo.html_url,
			primaryLanguage: repo.language
				? {
						name: repo.language,
						color: "#94a3b8",
				  }
				: null,
			stars: repo.stargazers_count,
			forks: repo.forks_count,
			updatedAt: repo.updated_at,
			topics: Array.isArray(repo.topics) ? repo.topics : [],
		}));

	return {
		profile,
		pinnedRepos,
	};
}

export async function fetchGitHubGraphQLDashboardData(): Promise<Pick<GitHubDashboardData, "profile" | "pinnedRepos">> {
	return fetchGitHubGraphQLDashboardDataWithOptions();
}

export async function fetchGitHubGraphQLDashboardDataWithOptions(options?: {
	revalidateSeconds?: number;
	forceFresh?: boolean;
	username?: string;
}): Promise<Pick<GitHubDashboardData, "profile" | "pinnedRepos">> {
	const token = normalizeEnv(process.env.GITHUB_TOKEN);
	const username = normalizeEnv(options?.username) || normalizeEnv(process.env.GITHUB_USERNAME) || "kabirajrana";
	const revalidateSeconds = options?.revalidateSeconds ?? 300;

	if (!token) {
		console.warn("[github-graphql] GITHUB_TOKEN missing; using public REST fallback", { username });
		return fetchGitHubPublicProfileAndRepos(username, options);
	}

	const response = await fetch(GITHUB_GRAPHQL_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		...(options?.forceFresh ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } }),
		body: JSON.stringify({
			query: DASHBOARD_QUERY,
			variables: {
				login: username,
			},
		}),
	});

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			console.warn("[github-graphql] GraphQL auth failed; using public REST fallback", {
				status: response.status,
				username,
			});
			return fetchGitHubPublicProfileAndRepos(username, options);
		}

		throw new Error(`GitHub GraphQL failed with status ${response.status}`);
	}

	const payload = (await response.json()) as GitHubGraphQLResponse;

	if (payload.errors?.length) {
		const message = payload.errors.map((error) => error.message).join("; ");
		if (message.toLowerCase().includes("bad credentials")) {
			console.warn("[github-graphql] GraphQL bad credentials; using public REST fallback", {
				username,
			});
			return fetchGitHubPublicProfileAndRepos(username, options);
		}

		throw new Error(message);
	}

	if (!payload.data?.user) {
		throw new Error("GitHub GraphQL returned no user data");
	}

	const profile: GitHubProfile = {
		name: payload.data.user.name ?? payload.data.user.login,
		login: payload.data.user.login,
		avatarUrl: payload.data.user.avatarUrl,
		bio: payload.data.user.bio ?? "",
		followers: payload.data.user.followers.totalCount,
		following: payload.data.user.following.totalCount,
		publicRepos: payload.data.user.repositories.totalCount,
		url: payload.data.user.url,
	};

	const pinnedRepos: GitHubPinnedRepo[] = payload.data.user.pinnedItems.nodes.map((repo) => ({
		name: repo.name,
		description: repo.description ?? "No description available.",
		url: repo.url,
		primaryLanguage: repo.primaryLanguage
			? {
					name: repo.primaryLanguage.name,
					color: repo.primaryLanguage.color ?? "#94a3b8",
			  }
			: null,
		stars: repo.stargazerCount,
		forks: repo.forkCount,
		updatedAt: repo.updatedAt,
		topics: repo.repositoryTopics.nodes.map((node) => node.topic.name),
	}));

	return {
		profile,
		pinnedRepos,
	};
}
