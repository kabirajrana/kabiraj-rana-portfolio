export type Project = {
	slug: string;
	title: string;
	tagline: string;
	summary: string;
	category: "AI/ML" | "Full Stack" | "Data Science";
	featured: boolean;
	year: string;
	role: string;
	duration: string;
	tech: string[];
	outcomes: string[];
	problem: string;
	solution: string;
	architecture: string[];
	links: {
		github: string;
		demo: string;
	};
	gallery: string[];
};
