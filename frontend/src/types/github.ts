export type GitHubProfile = {
	name: string;
	login: string;
	avatarUrl: string;
	bio: string;
	followers: number;
	following: number;
	publicRepos: number;
	url: string;
};

export type GitHubContributionDay = {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
	weekday: number;
};

export type GitHubPinnedRepo = {
	name: string;
	description: string;
	url: string;
	primaryLanguage: {
		name: string;
		color: string;
	} | null;
	stars: number;
	forks: number;
	updatedAt: string;
	topics: string[];
};

export type GitHubEvent = {
	id: string;
	type: string;
	title: string;
	description: string;
	repoName: string;
	url: string;
	createdAt: string;
};

export type GitHubDashboardData = {
	profile: GitHubProfile;
	contributions: {
		year: number;
		availableYears: number[];
		total: number;
		days: GitHubContributionDay[];
	};
	pinnedRepos: GitHubPinnedRepo[];
	recentEvents: GitHubEvent[];
};

export type GitHubDashboardResponse = {
	data: GitHubDashboardData;
	meta: {
		generatedAt: string;
		stale: boolean;
		warning?: string;
	};
};
