import Link from "next/link";

import { ProjectCard } from "@/components/cards/project-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { featuredProjects } from "@/content/projects";

export function FeaturedProjectsSection() {
	return (
		<Container className="py-14 md:py-16">
			<FadeIn className="flex items-end justify-between gap-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Projects</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Selected work.</h2>
				</div>
				<Button asChild variant="ghost" className="h-auto p-0 hover:bg-transparent">
					<Link href="/projects" className="story-link">
						View all
					</Link>
				</Button>
			</FadeIn>
			<div className="mt-8 grid gap-5 md:grid-cols-2">
				{featuredProjects.map((project, index) => (
					<FadeIn key={project.slug} delay={index * 0.08} className="min-w-0">
						<ProjectCard project={project} variant="featured" />
					</FadeIn>
				))}
			</div>
		</Container>
	);
}
