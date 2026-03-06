"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, GitBranch, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GitHubProfile } from "@/types/github";

export function GitHubHero({ profile }: { profile: GitHubProfile }) {
	return (
		<motion.section
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
			className="rounded-3xl border border-border/70 bg-[linear-gradient(145deg,hsl(var(--background)/0.9)_0%,hsl(var(--surface)/0.9)_100%)] p-5 sm:p-7"
		>
			<div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
				<div>
					<p className="section-subtitle">Engineering Signal</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">GitHub Activity</h1>
					<p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
						Automatically updated GitHub activity showing commits, repositories, and continuous engineering
						work.
					</p>
				</div>

				<Card className="border-border/70 bg-background/40">
					<CardHeader className="pb-4">
						<div className="flex items-center gap-3">
							<Image
								src={profile.avatarUrl}
								alt={`${profile.login} avatar`}
								width={48}
								height={48}
								unoptimized
								className="h-12 w-12 rounded-xl border border-border/70 object-cover"
							/>
							<div>
								<CardTitle className="text-base sm:text-lg">{profile.name}</CardTitle>
								<p className="text-xs text-muted">@{profile.login}</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted">{profile.bio || "Building and shipping AI + software systems."}</p>
						<div className="grid grid-cols-3 gap-2 text-center">
							<div className="rounded-lg border border-border/70 bg-surface/60 p-2">
								<p className="text-lg font-semibold">{profile.publicRepos}</p>
								<p className="text-[11px] text-muted">Repos</p>
							</div>
							<div className="rounded-lg border border-border/70 bg-surface/60 p-2">
								<p className="text-lg font-semibold inline-flex items-center gap-1">
									<Users size={13} className="text-accent" />
									{profile.followers}
								</p>
								<p className="text-[11px] text-muted">Followers</p>
							</div>
							<div className="rounded-lg border border-border/70 bg-surface/60 p-2">
								<p className="text-lg font-semibold inline-flex items-center gap-1">
									<GitBranch size={13} className="text-accent" />
									{profile.following}
								</p>
								<p className="text-[11px] text-muted">Following</p>
							</div>
						</div>
						<Button asChild size="sm" className="w-full">
							<a href={profile.url} target="_blank" rel="noreferrer">
								View GitHub Profile <ExternalLink size={14} className="ml-1" />
							</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		</motion.section>
	);
}
