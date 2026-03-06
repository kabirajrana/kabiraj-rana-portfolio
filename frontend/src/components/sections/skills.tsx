"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";
import {
	BarChart3,
	Bot,
	Brain,
	Boxes,
	Code2,
	Database,
	GitBranch,
	Link2,
	Server,
	SquareStack,
} from "lucide-react";

const expertiseLevels = [
	{ name: "Python", level: 95 },
	{ name: "Machine Learning", level: 88 },
	{ name: "Data Analysis / Visualization", level: 85 },
	{ name: "Deep Learning", level: 80 },
	{ name: "MLOps Basics", level: 75 },
	{ name: "FastAPI", level: 85 },
	{ name: "SQL", level: 82 },
	{ name: "Next.js / TypeScript", level: 80 },
];

const technologies = [
	{
		title: "Core AI/ML",
		items: [
			{ label: "Python", icon: Code2 },
			{ label: "NumPy", icon: BarChart3 },
			{ label: "Pandas", icon: BarChart3 },
			{ label: "Scikit-learn", icon: Brain },
			{ label: "PyTorch", icon: Bot },
		],
	},
	{
		title: "Data & Backend",
		items: [
			{ label: "FastAPI", icon: Server },
			{ label: "PostgreSQL", icon: Database },
			{ label: "SQL", icon: Database },
			{ label: "Docker", icon: Boxes },
			{ label: "Git", icon: GitBranch },
		],
	},
	{
		title: "Applied AI (RAG/Agents)",
		items: [
			{ label: "RAG", icon: Bot },
			{ label: "FAISS", icon: Bot },
			{ label: "LangChain", icon: Link2 },
			{ label: "Agents", icon: Brain },
		],
	},
	{
		title: "Web (Minimal)",
		items: [
			{ label: "Next.js", icon: SquareStack },
			{ label: "TypeScript", icon: SquareStack },
			{ label: "Tailwind", icon: SquareStack },
		],
	},
];

export function SkillsSection() {
	const sectionRef = useRef<HTMLDivElement | null>(null);
	const [isSectionVisible, setIsSectionVisible] = useState(false);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setIsSectionVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.35 }
		);

		observer.observe(section);
		return () => observer.disconnect();
	}, []);

	return (
		<Container className="py-14 md:py-16">
			<FadeIn className="relative overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(180deg,hsl(var(--surface)/0.72)_0%,hsl(var(--background)/0.92)_100%)] p-6 transition-[border-color,transform] duration-[1700ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:p-8 lg:p-9 lg:hover:-translate-y-0.5 lg:hover:border-border/85 motion-reduce:transform-none motion-reduce:transition-none">
				<div
					className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-accent/8 blur-3xl"
					aria-hidden="true"
				/>
				<div
					className="pointer-events-none absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-accent-2/8 blur-3xl"
					aria-hidden="true"
				/>

				<div ref={sectionRef} className="relative grid gap-9 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
					<div>
						<p
							className="text-xs font-semibold uppercase tracking-[0.32em] text-muted transition-[opacity,transform] duration-[1300ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
							style={{
								opacity: isSectionVisible ? 1 : 0,
								transform: isSectionVisible ? "translateY(0px)" : "translateY(12px)",
								transitionDelay: "220ms",
							}}
						>
							My Expertise
						</p>
						<h2
							className="mt-3 text-3xl font-semibold tracking-tight transition-[opacity,transform] duration-[1450ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:text-4xl"
							style={{
								opacity: isSectionVisible ? 1 : 0,
								transform: isSectionVisible ? "translateY(0px)" : "translateY(14px)",
								transitionDelay: "320ms",
							}}
						>
							Technologies & Skills
						</h2>
						<p
							className="mt-3 max-w-[36rem] text-base leading-relaxed text-muted transition-[opacity,transform] duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:text-[1.04rem]"
							style={{
								opacity: isSectionVisible ? 1 : 0,
								transform: isSectionVisible ? "translateY(0px)" : "translateY(14px)",
								transitionDelay: "420ms",
							}}
						>
							AI-first engineering across model experimentation, data pipelines, production APIs, and
							focused web delivery.
						</p>

						<div className="mt-8 space-y-5">
							{expertiseLevels.map((skill, index) => (
								<div key={skill.name} className="group/skill">
									<div className="mb-2 flex items-center justify-between gap-4 text-sm">
										<span className="font-semibold text-text">{skill.name}</span>
										<span className="text-muted transition-colors duration-500 group-hover/skill:text-text/90">{skill.level}%</span>
									</div>
									<div className="h-2 w-full overflow-hidden rounded-full border border-border/50 bg-surface-2/45 transition-colors duration-500 group-hover/skill:border-border/75">
										<div
											className="relative h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)/0.68)_0%,hsl(var(--accent-2)/0.52)_100%)] transition-[width,filter,box-shadow,background-image] duration-[3000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/skill:brightness-110 group-hover/skill:shadow-[0_0_18px_-8px_hsl(var(--accent)/0.95)]"
											style={{
												"--skill-level": `${skill.level}%`,
												width: isSectionVisible ? "var(--skill-level)" : "0%",
												transitionDelay: `${320 + index * 210}ms`,
											} as CSSProperties}
											aria-hidden="true"
										>
											<span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-text/75 transition-[transform,opacity] duration-700 ease-out group-hover/skill:scale-110 group-hover/skill:opacity-100" />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="pt-0.5">
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Technologies I Work With</p>
						<div className="mt-6 space-y-7">
							{technologies.map((group, groupIndex) => (
								<div
									key={group.title}
									className="transition-[opacity,transform] duration-[1700ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
									style={{
										opacity: isSectionVisible ? 1 : 0,
										transform: isSectionVisible ? "translateY(0px)" : "translateY(14px)",
										transitionDelay: `${860 + groupIndex * 320}ms`,
									}}
								>
									<h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-muted/90">{group.title}</h3>
									<div className="mt-3 flex flex-wrap gap-2.5">
										{group.items.map((item, itemIndex) => {
											const Icon = item.icon;
											return (
												<div
													key={item.label}
													className="inline-flex items-center gap-2.5 rounded-full border border-border/75 bg-background/35 px-3.5 py-2 text-sm text-text/90 transition-[opacity,transform,border-color,background-color] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-border/95 hover:bg-background/55 active:translate-y-[1px] motion-reduce:transform-none motion-reduce:transition-none"
													style={{
														opacity: isSectionVisible ? 1 : 0,
														transform: isSectionVisible ? "translateY(0px)" : "translateY(10px)",
														transitionDelay: `${980 + groupIndex * 320 + itemIndex * 170}ms`,
													}}
												>
													<span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/75 bg-surface/80 text-muted transition-colors duration-500">
														<Icon size={12} />
													</span>
													{item.label}
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</FadeIn>
		</Container>
	);
}
