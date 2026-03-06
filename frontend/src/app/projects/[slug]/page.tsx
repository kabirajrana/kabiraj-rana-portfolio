import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { projects, getProjectBySlug } from "@/content/projects";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
	return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const project = getProjectBySlug(slug);
	if (!project) {
		return buildMetadata({ title: "Project", description: "Project not found", path: "/projects" });
	}

	return buildMetadata({
		title: project.title,
		description: project.summary,
		path: `/projects/${project.slug}`,
	});
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const project = getProjectBySlug(slug);

	if (!project) {
		notFound();
	}

	const index = projects.findIndex((item) => item.slug === project.slug);
	const prevProject = index > 0 ? projects[index - 1] : undefined;
	const nextProject = index < projects.length - 1 ? projects[index + 1] : undefined;

	return (
		<Container className="py-16 md:py-24">
			<FadeIn>
				<div className="flex flex-wrap items-center gap-3">
					<Badge variant="accent">{project.category}</Badge>
					<span className="text-sm text-muted">{project.year}</span>
				</div>
				<h1 className="mt-3 text-4xl font-semibold tracking-tight">{project.title}</h1>
				<p className="mt-4 max-w-3xl text-muted">{project.summary}</p>
			</FadeIn>

			<div className="mt-8 grid gap-6 md:grid-cols-3">
				<Card>
					<CardContent className="space-y-3 pt-6 text-sm">
						<p>
							<span className="text-muted">Role:</span> {project.role}
						</p>
						<p>
							<span className="text-muted">Duration:</span> {project.duration}
						</p>
						<p>
							<span className="text-muted">Year:</span> {project.year}
						</p>
					</CardContent>
				</Card>
				<Card className="md:col-span-2">
					<CardContent className="flex flex-wrap gap-2 pt-6">
						{project.tech.map((tech) => (
							<Badge key={tech}>{tech}</Badge>
						))}
					</CardContent>
				</Card>
			</div>

			<div className="mt-10 space-y-8">
				<section>
					<h2 className="text-2xl font-semibold">Problem</h2>
					<p className="mt-3 text-muted">{project.problem}</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold">Solution</h2>
					<p className="mt-3 text-muted">{project.solution}</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold">Architecture</h2>
					<ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
						{project.architecture.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</section>

				<section>
					<h2 className="text-2xl font-semibold">Outcomes</h2>
					<ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
						{project.outcomes.map((outcome) => (
							<li key={outcome}>{outcome}</li>
						))}
					</ul>
				</section>

				<section>
					<h2 className="text-2xl font-semibold">Gallery</h2>
					<div className="mt-4 grid gap-4 md:grid-cols-3">
						{project.gallery.map((item) => (
							<div key={item} className="glass rounded-xl p-6 text-sm text-muted">
								{item}
							</div>
						))}
					</div>
				</section>
			</div>

			<div className="mt-10 flex flex-wrap gap-3">
				<Button asChild>
					<a href={project.links.github} target="_blank" rel="noreferrer">
						GitHub
					</a>
				</Button>
				<Button asChild variant="outline">
					<a href={project.links.demo} target="_blank" rel="noreferrer">
						Live Demo
					</a>
				</Button>
			</div>

			<Separator className="my-12" />

			<div className="flex flex-wrap justify-between gap-3">
				{prevProject ? (
					<Button asChild variant="outline">
						<Link href={`/projects/${prevProject.slug}`}>← {prevProject.title}</Link>
					</Button>
				) : (
					<span />
				)}

				{nextProject ? (
					<Button asChild variant="outline">
						<Link href={`/projects/${nextProject.slug}`}>{nextProject.title} →</Link>
					</Button>
				) : null}
			</div>
		</Container>
	);
}
