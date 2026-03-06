import { SkillGroup } from "@/types/site";

export const skillGroups: SkillGroup[] = [
	{
		group: "AI / ML",
		items: [
			{ name: "Python", level: 90 },
			{ name: "scikit-learn", level: 82 },
			{ name: "Pandas", level: 88 },
			{ name: "TensorFlow", level: 70 },
		],
	},
	{
		group: "Web Engineering",
		items: [
			{ name: "Next.js", level: 86 },
			{ name: "TypeScript", level: 84 },
			{ name: "FastAPI", level: 88 },
			{ name: "Tailwind", level: 90 },
		],
	},
	{
		group: "Tools & Workflow",
		items: [
			{ name: "Git/GitHub", level: 87 },
			{ name: "Docker", level: 72 },
			{ name: "CI/CD", level: 68 },
			{ name: "MLOps Basics", level: 65 },
		],
	},
];

export const skillTags = ["LLMs", "RAG", "Agents", "MLOps", "Data Pipelines", "APIs"];
