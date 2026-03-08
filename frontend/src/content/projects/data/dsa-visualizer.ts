import { Project } from "@/types/project";

export const dsaVisualizerProject: Project = {
	slug: "dsa-visualizer",
	title: "DSA Visualizer",
	tagline: "Interactive algorithm playground for faster conceptual learning",
	summary:
		"A high-performance web app that visualizes sorting, graph traversal, and pathfinding algorithms with step controls and clear complexity hints.",
	category: "Full-Stack",
	featured: true,
	year: "2025",
	role: "Full-Stack Developer",
	duration: "3 months",
	tech: ["Next.js", "TypeScript", "Tailwind", "Framer Motion", "Python"],
	outcomes: [
		"Improved algorithm concept retention through frame-by-frame visualization",
		"Reduced UI latency during heavy animation cycles via memoized rendering",
		"Created reusable animation primitives for future educational modules",
	],
	problem:
		"Most DSA learners struggle to translate pseudocode into mental models. Static diagrams do not show transitions, edge updates, or runtime behavior in real time.",
	solution:
		"Built a modular visual engine with controllable simulation speed, pause/step state machine, and clear event markers for each algorithm transition.",
	architecture: [
		"App Router pages for algorithm categories",
		"Stateful simulation core for queue/stack/graph events",
		"Canvas + DOM hybrid rendering for performance and accessibility",
		"Config-driven algorithm descriptors for scalability",
	],
	links: {
		github: "https://github.com/kabirajrana/DSA-Visualizer-Pro",
		demo: "https://www.algovx.me/",
	},
	gallery: ["Sorting panel", "Pathfinding arena", "Complexity insights"],
};
