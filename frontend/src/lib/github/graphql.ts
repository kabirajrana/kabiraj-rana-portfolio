import "server-only";

import type {
	GitHubDashboardData,
	GitHubPinnedRepo,
	GitHubProfile,
} from "@/types/github";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

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

export async function fetchGitHubGraphQLDashboardData(): Promise<Pick<GitHubDashboardData, "profile" | "pinnedRepos">> {
	return fetchGitHubGraphQLDashboardDataWithOptions();
}

export async function fetchGitHubGraphQLDashboardDataWithOptions(options?: {
	revalidateSeconds?: number;
	forceFresh?: boolean;
}): Promise<Pick<GitHubDashboardData, "profile" | "pinnedRepos">> {
	const token = process.env.GITHUB_TOKEN;
	const username = process.env.GITHUB_USERNAME ?? "kabirajrana";
	const revalidateSeconds = options?.revalidateSeconds ?? 300;

	if (!token) {
		throw new Error("Missing GITHUB_TOKEN");
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
		throw new Error(`GitHub GraphQL failed with status ${response.status}`);
	}

	const payload = (await response.json()) as GitHubGraphQLResponse;

	if (payload.errors?.length) {
		throw new Error(payload.errors.map((error) => error.message).join("; "));
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
