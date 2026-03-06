import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";


export function ProjectCard({
	project,
	variant = "default",
}: {
	project: Project;
	variant?: "default" | "featured";
}) {
	if (variant === "featured") {
		return (
			<article className="h-full w-full min-w-0 translate-y-0 transform-gpu rounded-3xl border border-border/70 bg-[linear-gradient(135deg,hsl(var(--background)/0.7)_0%,hsl(var(--surface)/0.58)_100%)] p-4 sm:p-5 will-change-transform transition-[transform,box-shadow,border-color,background-color] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-border/95 hover:bg-[linear-gradient(135deg,hsl(var(--background)/0.76)_0%,hsl(var(--surface)/0.64)_100%)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.58),0_0_0_8px_hsl(var(--primary)/0.3),0_0_34px_-10px_hsl(var(--primary)/0.45)] active:translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none">
				<div className="flex items-start justify-between gap-3">
					<h3 className="min-w-0 flex-1 overflow-hidden text-lg font-semibold leading-tight tracking-tight text-text md:text-xl">
						<span className="block break-words">{project.title}</span>
					</h3>
					<Link
						href={`/projects/${project.slug}`}
						aria-label={`Open ${project.title} case study`}
						className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-text transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-border/90 hover:bg-background/55"
					>
						<ArrowRight size={17} />
					</Link>
				</div>

				<p className="mt-3 text-xs leading-relaxed text-muted md:text-sm">{project.summary}</p>

				<div className="mt-4 flex flex-wrap gap-2">
					{project.tech.slice(0, 4).map((item) => (
						<span
							key={item}
							className="rounded-full border border-border/70 bg-background/30 px-2.5 py-1 text-xs text-muted"
						>
							{item}
						</span>
					))}
				</div>

				<div className="mt-6 border-t border-border/55 pt-2.5">
					<Link
						href={`/projects/${project.slug}`}
						className="inline-flex text-xs uppercase tracking-[0.22em] text-muted transition-colors duration-200 hover:text-text"
					>
						Case study
					</Link>
				</div>
			</article>
		);
	}

	return (
		<Card className="group h-full rounded-3xl border-border/70 bg-[linear-gradient(135deg,hsl(var(--background)/0.8)_0%,hsl(var(--surface)/0.66)_100%)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.2),0_0_20px_-12px_hsl(var(--accent)/0.38)]">
			<CardHeader className="space-y-2 p-5">
				<div className="flex items-center justify-between gap-3">
					<Badge variant="accent">{project.category}</Badge>
					<span className="text-xs text-muted">{project.year}</span>
				</div>
				<CardTitle className="text-[1.55rem] font-semibold leading-tight tracking-tight md:text-[1.7rem]">{project.title}</CardTitle>
				<CardDescription className="text-[0.98rem] leading-relaxed text-muted">{project.summary}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 px-5 pb-5">
				<div className="flex flex-wrap gap-2.5">
					{project.tech.slice(0, 4).map((item) => (
						<span
							key={item}
							className="rounded-full border border-border/70 bg-background/35 px-2.5 py-1 text-xs text-muted"
						>
							{item}
						</span>
					))}
				</div>

				<div className="flex flex-wrap gap-3">
					<a
						href={project.links.github}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center rounded-full border border-border/75 bg-background/35 px-3.5 py-[0.44rem] text-[0.9rem] font-medium tracking-[0.08em] text-text transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.2)]"
					>
						GitHub <span className="ml-2">→</span>
					</a>
					<a
						href={project.links.demo}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center rounded-full border border-border/75 bg-surface/65 px-3.5 py-[0.44rem] text-[0.9rem] font-medium tracking-[0.08em] text-text transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.2)]"
					>
						Live Demo <span className="ml-2">→</span>
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
