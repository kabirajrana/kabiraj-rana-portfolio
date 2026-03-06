"use client";

import { GitCommitHorizontal, GitPullRequestArrow, Rocket, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GitHubEvent } from "@/types/github";

function iconForType(type: string) {
	if (type === "PushEvent") return GitCommitHorizontal;
	if (type === "PullRequestEvent") return GitPullRequestArrow;
	if (type === "ReleaseEvent") return Rocket;
	return Sparkles;
}

function formatDate(date: string) {
	return new Date(date).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function RecentActivity({ events }: { events: GitHubEvent[] }) {
	if (!events.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Public Activity</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted">No recent public activity was returned by GitHub.</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border/70 bg-[linear-gradient(145deg,hsl(var(--surface)/0.72)_0%,hsl(var(--background)/0.9)_100%)]">
			<CardHeader>
				<CardTitle>Recent Public Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<ol className="relative space-y-5 border-l border-border/70 pl-5">
					{events.slice(0, 20).map((event) => {
						const EventIcon = iconForType(event.type);

						return (
							<li key={event.id} className="relative">
								<span className="absolute -left-[1.78rem] top-0 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-surface">
									<EventIcon size={13} className="text-accent" />
								</span>
								<div className="rounded-xl border border-border/70 bg-background/35 p-3 transition-colors duration-300 hover:border-accent/40">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<p className="text-sm font-medium text-text">{event.title}</p>
										<p className="text-xs text-muted">{formatDate(event.createdAt)}</p>
									</div>
									<p className="mt-1 text-xs text-muted">{event.repoName}</p>
									<p className="mt-2 text-sm text-muted">{event.description}</p>
									<a
										href={event.url}
										target="_blank"
										rel="noreferrer"
										className="mt-2 inline-flex text-xs text-accent hover:text-accent/80"
									>
										Open on GitHub →
									</a>
								</div>
							</li>
						);
					})}
				</ol>
			</CardContent>
		</Card>
	);
}
