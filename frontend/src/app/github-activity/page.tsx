import { GitHubDashboardTabs } from "@/components/github/GitHubDashboardTabs";
import { GitHubHero } from "@/components/github/GitHubHero";
import { Container } from "@/components/layout/container";
import { getContributionsByYearWithOptions } from "@/lib/github/contributions";
import { fetchGitHubGraphQLDashboardDataWithOptions } from "@/lib/github/graphql";
import { fetchGitHubRecentPublicEvents } from "@/lib/github/rest";
import { buildMetadata } from "@/lib/seo";
import type { GitHubDashboardData, GitHubProfile } from "@/types/github";

export const metadata = buildMetadata({
  title: "GitHub Activity",
  description: "Live GitHub profile, repositories, activity, and contributions dashboard.",
  path: "/github-activity",
});

function normalizeEnv(value: string | undefined): string {
  const trimmed = String(value ?? "").trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function fallbackProfile(username: string): GitHubProfile {
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

async function getGitHubDashboardData(): Promise<{ data: GitHubDashboardData; warning?: string }> {
  const username = normalizeEnv(process.env.GITHUB_USERNAME) || "kabirajrana";
  const currentYear = new Date().getFullYear();

  const [profileAndRepos, contributions, recentEvents] = await Promise.allSettled([
    fetchGitHubGraphQLDashboardDataWithOptions({ username, revalidateSeconds: 180 }),
    getContributionsByYearWithOptions(username, currentYear, { revalidateSeconds: 60 }),
    fetchGitHubRecentPublicEvents({ username, revalidateSeconds: 45 }),
  ]);

  const warnings: string[] = [];

  const profile =
    profileAndRepos.status === "fulfilled"
      ? profileAndRepos.value.profile
      : (warnings.push("Profile/repo data unavailable."), fallbackProfile(username));

  const pinnedRepos = profileAndRepos.status === "fulfilled" ? profileAndRepos.value.pinnedRepos : [];

  const contributionData =
    contributions.status === "fulfilled"
      ? contributions.value
      : (warnings.push("Contributions data unavailable."), { year: currentYear, total: 0, days: [] });

  const events =
    recentEvents.status === "fulfilled"
      ? recentEvents.value
      : (warnings.push("Recent activity unavailable."), []);

  return {
    data: {
      profile,
      contributions: {
        year: contributionData.year,
        availableYears: [currentYear, currentYear - 1],
        total: contributionData.total,
        days: contributionData.days,
      },
      pinnedRepos,
      recentEvents: events,
    },
    warning: warnings.length ? `Some GitHub sections are temporarily unavailable: ${warnings.join(" ")}` : undefined,
  };
}

export default async function GitHubActivityPage() {
  const { data, warning } = await getGitHubDashboardData();

  return (
    <Container className="py-16 md:py-24">
      <div className="space-y-6">
        <GitHubHero profile={data.profile} />
        {warning ? (
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{warning}</div>
        ) : null}
        <GitHubDashboardTabs data={data} />
      </div>
    </Container>
  );
}
