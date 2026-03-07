import Image from "next/image";
import { BarChart3, BrainCircuit, Compass, Rocket } from "lucide-react";

import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { buildMetadata } from "@/lib/seo";

const profileTags = ["LLMs", "RAG", "Agents", "MLOps"];

const journeyCards = [
	{
		title: "The Beginning",
		description:
			"I started with curiosity for how software shapes daily life, then focused on clean interfaces and solid engineering foundations.",
		bullets: [
			"Strong fundamentals in modern web architecture",
			"Focus on clarity-first product building",
		],
	},
	{
		title: "The Shift to AI",
		description:
			"I moved deeper into AI/ML to build systems that are not only functional, but intelligently adaptive and useful in production.",
		bullets: ["Practical model-to-product thinking", "System design mindset for reliability and scale"],
	},
	{
		title: "What I build today",
		description:
			"I build intelligent web products by combining full-stack engineering with applied ML workflows and measurable UX outcomes.",
		bullets: ["AI-powered applications and internal tools", "Production-ready APIs and maintainable codebases"],
	},
	{
		title: "What I’m exploring now",
		description:
			"I’m currently focused on modern AI systems that connect retrieval, reasoning, and orchestration for real product impact.",
		bullets: ["LLM apps and RAG pipelines", "MLOps patterns for continuous improvement"],
	},
];

const approachCards = [
	{
		title: "Reliability by Design",
		description: "I architect with stability in mind from day one—clear boundaries, clean interfaces, and safe iteration.",
		icon: Rocket,
	},
	{
		title: "Data-Informed Decisions",
		description: "I use metrics and feedback loops to prioritize what matters most for users and product growth.",
		icon: BarChart3,
	},
	{
		title: "Human-Centered UX",
		description: "Even technical systems should feel intuitive, fast, and trustworthy for the people using them.",
		icon: Compass,
	},
	{
		title: "Iterate to Production",
		description: "I move from prototypes to production with pragmatic tradeoffs, maintainability, and delivery speed.",
		icon: BrainCircuit,
	},
];

export const metadata = buildMetadata({
	title: "About",
	description: "How Kabiraj Rana builds AI-enabled products and approaches engineering.",
	path: "/about",
});

export default function AboutPage() {
	return (
		<Container className="py-14 md:py-20">
			<FadeIn className="relative overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(132deg,hsl(var(--background)/0.98)_0%,hsl(var(--surface)/0.94)_56%,hsl(var(--surface-2)/0.9)_100%)] p-5 sm:p-6 md:p-8">
				<div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
				<div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-[hsl(var(--accent-2)/0.12)] blur-3xl" aria-hidden="true" />

				<div className="relative grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
					<aside className="mx-auto w-full max-w-[300px] rounded-2xl border border-border/75 bg-[linear-gradient(150deg,hsl(var(--surface)/0.62)_0%,hsl(var(--surface-2)/0.5)_100%)] p-4 shadow-[0_18px_38px_-34px_hsl(var(--accent)/0.18)] backdrop-blur-xl lg:mx-0">
						<div className="mx-auto h-[154px] w-[154px] overflow-hidden rounded-full border border-accent/35 p-1">
							<Image
								src="/images/kabirajrana.png"
								alt="Kabiraj Rana"
								width={154}
								height={154}
								className="h-full w-full rounded-full object-cover object-[50%_16%]"
								priority
							/>
						</div>

						<div className="mx-auto mt-4 w-fit rounded-full border border-border/60 bg-background/95 px-4 py-1.5 text-[0.74rem] font-semibold tracking-[0.06em] text-text shadow-[0_8px_20px_-14px_hsl(var(--accent)/0.35)]">
							Focus: AI / ML
						</div>

						<div className="mt-4 flex flex-wrap justify-center gap-2">
							{profileTags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-border/70 bg-surface-2/65 px-2.5 py-1 text-xs text-muted shadow-[0_12px_28px_-24px_rgba(48,170,255,0.7)]"
								>
									{tag}
								</span>
							))}
						</div>
					</aside>

					<section>
						<p className="text-xs uppercase tracking-[0.24em] text-muted">My Story</p>
						<h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
							From curiosity to building intelligent systems.
						</h1>
						<p className="mt-3 max-w-3xl text-base leading-relaxed text-muted md:text-[1.03rem]">
							I design practical AI-driven products with clean architecture and product thinking—blending modern
							engineering discipline with applied machine learning.
						</p>

						<div className="mt-5 space-y-3">
							{journeyCards.map((card, index) => (
								<FadeIn key={card.title} delay={0.05 * index} y={12}>
									<article className="rounded-2xl border border-border/70 bg-[linear-gradient(140deg,hsl(var(--background)/0.66)_0%,hsl(var(--surface)/0.56)_100%)] p-4 transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_16px_28px_-20px_hsl(var(--accent)/0.45)]">
										<h2 className="text-sm font-semibold md:text-base">{card.title}</h2>
										<p className="mt-2 text-sm leading-relaxed text-muted md:text-[0.95rem]">{card.description}</p>
										<ul className="mt-3 space-y-1.5 text-sm text-muted md:text-[0.95rem]">
											{card.bullets.map((bullet) => (
												<li key={bullet} className="flex items-start gap-2">
													<span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-accent" />
													<span>{bullet}</span>
												</li>
											))}
										</ul>
									</article>
								</FadeIn>
							))}
						</div>

						<div className="mt-8">
							<p className="text-xs uppercase tracking-[0.24em] text-muted">My Approach</p>
							<h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
								How I build — principles that guide my work.
							</h2>
							<div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
								{approachCards.map((card, index) => (
									<FadeIn key={card.title} delay={0.05 * index} y={10}>
										<article className="h-full rounded-xl border border-border/70 bg-surface/45 p-3.5 transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_14px_24px_-20px_hsl(var(--accent)/0.4)]">
											<div className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/70 bg-background/45 text-accent">
												<card.icon size={15} />
											</div>
											<h3 className="mt-2.5 text-sm font-semibold">{card.title}</h3>
											<p className="mt-1.5 text-sm leading-relaxed text-muted">{card.description}</p>
										</article>
									</FadeIn>
								))}
							</div>
						</div>

						<blockquote className="mt-8 border-t border-border/60 pt-4 text-center text-base italic text-text/95 md:text-lg">
							“Ship small, learn fast, and let the product prove the idea.”
							<footer className="mt-2 text-sm not-italic text-muted">— Kabiraj Rana</footer>
						</blockquote>
					</section>
				</div>
			</FadeIn>
		</Container>
	);
}
