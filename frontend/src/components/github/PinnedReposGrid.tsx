"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitFork, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GitHubPinnedRepo } from "@/types/github";

function formatDate(date: string) {
	return new Date(date).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function PinnedReposGrid({ repos }: { repos: GitHubPinnedRepo[] }) {
	if (!repos.length) {
		return (
			<Card>
				<CardContent className="pt-6 text-sm text-muted">No pinned repositories available right now.</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			{repos.slice(0, 6).map((repo, index) => (
				<motion.article
					key={repo.name}
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-70px" }}
					transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
				>
					<Card className="group h-full border-border/70 bg-[linear-gradient(145deg,hsl(var(--surface)/0.72)_0%,hsl(var(--background)/0.9)_100%)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-accent/45 hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.32),0_0_22px_-10px_hsl(var(--accent)/0.48)]">
						<CardHeader className="space-y-2">
							<div className="flex items-start justify-between gap-3">
								<CardTitle className="text-lg">
									<a
										href={repo.url}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-1.5 hover:text-accent"
									>
										{repo.name}
										<ExternalLink size={14} />
									</a>
								</CardTitle>
								<p className="text-[11px] text-muted">Updated {formatDate(repo.updatedAt)}</p>
							</div>
							<p className="text-sm text-muted">{repo.description}</p>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-wrap items-center gap-3 text-sm text-muted">
								{repo.primaryLanguage ? (
									<span className="inline-flex items-center gap-1.5">
										<span
											className="h-2.5 w-2.5 rounded-full"
											style={{ backgroundColor: repo.primaryLanguage.color }}
										/>
										{repo.primaryLanguage.name}
									</span>
								) : null}
								<span className="inline-flex items-center gap-1">
									<Star size={13} className="text-accent" /> {repo.stars}
								</span>
								<span className="inline-flex items-center gap-1">
									<GitFork size={13} className="text-accent" /> {repo.forks}
								</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{repo.topics.length ? (
									repo.topics.slice(0, 6).map((topic) => <Badge key={topic}>{topic}</Badge>)
								) : (
									<Badge>No topics</Badge>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.article>
			))}
		</div>
	);
}
