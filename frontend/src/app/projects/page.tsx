import { Container } from "@/components/layout/container";
import { ProjectsShowcase } from "@/components/sections/projects-showcase";
import { contentRepository } from "@/lib/db/repositories";
import { buildMetadata } from "@/lib/seo";
import type { Project } from "@/types/project";

type ProjectRow = Awaited<ReturnType<typeof contentRepository.listProjects>>[number];
type CategoryRow = Awaited<ReturnType<typeof contentRepository.listProjectCategories>>[number];

export const metadata = buildMetadata({
	title: "Projects",
	description: "AI/ML and full-stack case studies by Kabiraj Rana.",
	path: "/projects",
});

export default async function ProjectsPage() {
	const [pageConfig, categories, projects] = await Promise.all([
		contentRepository.getProjectsPageConfig(),
		contentRepository.listProjectCategories(),
		contentRepository.listProjects({ status: "PUBLISHED" }),
	]);

	const mappedProjects: Project[] = (projects as ProjectRow[]).map((project: ProjectRow) => ({
		slug: project.slug,
		title: project.title,
		tagline: project.summary,
		summary: project.summary,
		category: (project.category as Project["category"]) ?? "AI/ML",
		featured: project.featured,
		year: project.year ?? "",
		role: "",
		duration: "",
		tech: Array.isArray(project.techStack) ? (project.techStack as string[]) : [],
		outcomes: Array.isArray(project.highlights) ? (project.highlights as string[]) : [],
		problem: "",
		solution: "",
		architecture: [],
		links: {
			github: project.githubUrl ?? "#",
			demo: project.liveUrl ?? "#",
		},
		gallery: Array.isArray(project.screenshots) ? (project.screenshots as string[]) : [],
	}));

	const filterLabels = (categories as CategoryRow[])
		.filter((item: CategoryRow) => item.isVisible)
		.map((item: CategoryRow) => item.label);

	return (
		<Container className="py-16 md:py-24">
			<ProjectsShowcase
				projects={mappedProjects}
				smallLabel={pageConfig?.smallLabel ?? "PROJECTS"}
				title={pageConfig?.title ?? "All projects."}
				subtitle={pageConfig?.subtitle ?? "A curated collection of AI and engineering work built with product focus and production discipline."}
				filters={filterLabels.length ? filterLabels : ["All Projects"]}
			/>
		</Container>
	);
}
