"use client";

import { useMemo, useState } from "react";

import { FadeIn } from "@/components/motion/fade-in";
import { ProjectCard } from "@/components/cards/project-card";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";

export function ProjectsShowcase({
	projects,
	smallLabel,
	title,
	subtitle,
	filters,
}: {
	projects: Project[];
	smallLabel: string;
	title: string;
	subtitle: string;
	filters: string[];
}) {
	const firstFilter = filters[0] ?? "All Projects";
	const [activeFilter, setActiveFilter] = useState<string>(firstFilter);

	const filteredProjects = useMemo(() => {
		if (activeFilter === firstFilter) {
			return projects;
		}

		return projects.filter((project) => project.category === activeFilter);
	}, [activeFilter, projects, firstFilter]);

	return (
		<>
			<FadeIn className="relative overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(132deg,hsl(var(--background)/0.98)_0%,hsl(var(--surface)/0.94)_56%,hsl(var(--surface-2)/0.9)_100%)] p-5 md:p-6">
				<div className="pointer-events-none absolute -left-12 -top-10 h-52 w-52 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
				<div className="pointer-events-none absolute -right-8 bottom-0 h-56 w-56 rounded-full bg-[hsl(var(--accent-2)/0.1)] blur-3xl" aria-hidden="true" />

				<div className="relative">
					<p className="section-subtitle">{smallLabel}</p>
					<h1 className="mt-2 text-[2rem] font-semibold tracking-tight md:text-[2.8rem]">{title}</h1>
					<p className="mt-3 max-w-3xl text-sm text-muted md:text-base md:leading-relaxed">
						{subtitle}
					</p>

					<div className="mt-5 flex flex-wrap gap-2.5">
						{filters.map((filter) => (
							<Button
								key={filter}
								type="button"
								size="sm"
								variant={activeFilter === filter ? "default" : "outline"}
								className="rounded-full"
								onClick={() => setActiveFilter(filter)}
							>
								{filter}
							</Button>
						))}
					</div>
				</div>
			</FadeIn>

			<div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
				{filteredProjects.map((project, idx) => (
					<FadeIn key={project.slug} delay={idx * 0.06}>
						<ProjectCard project={project} />
					</FadeIn>
				))}
			</div>
		</>
	);
}
