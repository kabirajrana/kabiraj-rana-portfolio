import { dsaVisualizerProject } from "@/content/projects/data/dsa-visualizer";
import { phishingDetectorProject } from "@/content/projects/data/phishing-detector";
import { Project } from "@/types/project";

export const projects: Project[] = [dsaVisualizerProject, phishingDetectorProject];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProjectBySlug(slug: string): Project | undefined {
	return projects.find((project) => project.slug === slug);
}
