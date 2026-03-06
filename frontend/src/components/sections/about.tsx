import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

const profileTags = ["LLMs", "RAG", "Agents", "MLOps"];

export function AboutPreviewSection() {
	return (
		<Container className="py-14 md:py-[4.6rem]">
			<FadeIn className="relative overflow-hidden rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_88%_40%,hsl(var(--accent)/0.1)_0%,transparent_40%),linear-gradient(132deg,hsl(var(--background)/0.98)_0%,hsl(var(--surface)/0.92)_52%,hsl(var(--surface-2)/0.9)_100%)] p-6 md:p-8">
				<div
					className="pointer-events-none absolute -top-24 right-2 h-72 w-72 rounded-full bg-accent/6 blur-3xl"
					aria-hidden="true"
				/>
				<div
					className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 rounded-full bg-accent-2/6 blur-3xl"
					aria-hidden="true"
				/>

				<div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1.14fr)_minmax(280px,0.86fr)] lg:gap-8">
					<div className="order-2 space-y-3.5 md:space-y-[1.125rem] lg:order-1">
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">About Me</p>
						<h2 className="max-w-[38.5rem] text-[1.52rem] font-semibold leading-[1.12] tracking-tight md:text-[1.78rem] lg:text-[2rem]">
							Designing practical AI systems with clarity and impact.
						</h2>

						<p className="max-w-[38.75rem] text-sm leading-[1.72] text-muted md:text-[0.99rem]">
							I&apos;m an AI/ML-focused full-stack engineer building production-grade systems with
							modern web architecture and applied machine learning. I care about clarity,
							reliability, and measurable product impact.
						</p>

						<div className="space-y-2.5 pt-1.5">
							<FadeIn
								delay={0.08}
								y={16}
								className=""
							>
								<div className="transform-gpu rounded-2xl border border-border/70 bg-[linear-gradient(140deg,hsl(var(--background)/0.66)_0%,hsl(var(--surface)/0.56)_100%)] p-3.5 transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 active:translate-y-[1px] hover:border-border/90 hover:bg-[linear-gradient(140deg,hsl(var(--background)/0.75)_0%,hsl(var(--surface)/0.66)_100%)] hover:shadow-[0_20px_38px_-24px_hsl(var(--accent)/0.35)]">
									<h3 className="text-sm font-semibold md:text-base">What I build</h3>
									<p className="mt-1.5 text-xs leading-relaxed text-muted md:text-sm">
										AI-powered web products, practical dashboards, and automation systems with real-world
										impact.
									</p>
								</div>
							</FadeIn>

							<FadeIn
								delay={0.18}
								y={16}
								className=""
							>
								<div className="transform-gpu rounded-2xl border border-border/70 bg-[linear-gradient(140deg,hsl(var(--background)/0.66)_0%,hsl(var(--surface)/0.56)_100%)] p-3.5 transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 active:translate-y-[1px] hover:border-border/90 hover:bg-[linear-gradient(140deg,hsl(var(--background)/0.75)_0%,hsl(var(--surface)/0.66)_100%)] hover:shadow-[0_20px_38px_-24px_hsl(var(--accent)/0.35)]">
									<h3 className="text-sm font-semibold md:text-base">How I work</h3>
									<p className="mt-1.5 text-xs leading-relaxed text-muted md:text-sm">
										Prototype quickly, validate with data, and ship clean, production-grade systems.
									</p>
								</div>
							</FadeIn>

							<FadeIn
								delay={0.28}
								y={16}
								className=""
							>
								<div className="transform-gpu rounded-2xl border border-border/70 bg-[linear-gradient(140deg,hsl(var(--background)/0.66)_0%,hsl(var(--surface)/0.56)_100%)] p-3.5 transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 active:translate-y-[1px] hover:border-border/90 hover:bg-[linear-gradient(140deg,hsl(var(--background)/0.75)_0%,hsl(var(--surface)/0.66)_100%)] hover:shadow-[0_20px_38px_-24px_hsl(var(--accent)/0.35)]">
									<h3 className="text-sm font-semibold md:text-base">What I&apos;m exploring now</h3>
									<p className="mt-1.5 text-xs leading-relaxed text-muted md:text-sm">
										LLMs, RAG pipelines, agents, and applied MLOps for intelligent software.
									</p>
								</div>
							</FadeIn>
						</div>

						<Button
							asChild
							variant="ghost"
							className="mt-5 h-auto justify-start p-0 hover:bg-transparent md:mt-[1.375rem]"
						>
							<Link href="/about" className="story-link">
								Explore my story &rarr;
							</Link>
						</Button>
					</div>

					<div className="order-1 relative flex justify-center pt-2 lg:order-2 lg:justify-end lg:pt-0">
						<div
							className="pointer-events-none absolute right-6 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl"
							aria-hidden="true"
						/>
						<div className="relative w-full max-w-[344px] transform-gpu rounded-3xl border border-border/75 bg-[linear-gradient(150deg,hsl(var(--surface)/0.62)_0%,hsl(var(--surface-2)/0.5)_100%)] p-6 pb-8 shadow-[0_18px_38px_-34px_hsl(var(--accent)/0.18)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hover:-translate-y-1 active:translate-y-[1px] motion-reduce:transform-none motion-reduce:transition-none lg:min-h-[474px]">
							<div
								className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-surface-2/30 via-transparent to-surface/14"
								aria-hidden="true"
							/>
							<div className="relative mx-auto mt-1 flex h-[246px] w-[246px] items-center justify-center">
								<div
									className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(54,184,255,0.18)_0%,rgba(54,184,255,0.1)_30%,transparent_70%)]"
									aria-hidden="true"
								/>
								<div className="relative h-[236px] w-[236px] overflow-hidden rounded-full border border-accent/40 shadow-[0_0_0_4px_hsl(var(--accent)/0.07)]">
									<div
										className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.12)_0%,transparent_69%)]"
										aria-hidden="true"
									/>
									<Image
										src="/images/kabirajrana.png"
										alt="Kabiraj Rana"
										width={236}
										height={236}
										className="relative z-[1] h-full w-full scale-100 object-cover object-[50%_16%] transition-none"
										priority
									/>
								</div>
							</div>

							<div className="relative mx-auto mt-6 w-fit rounded-full border border-border/60 bg-background/95 px-5 py-2 text-[0.82rem] font-semibold tracking-[0.06em] text-text shadow-[0_8px_20px_-14px_hsl(var(--accent)/0.35)]">
								Focus: AI / ML
							</div>

							<div className="relative mt-[1.375rem] flex flex-wrap justify-center gap-2.5">
								{profileTags.map((tag) => (
									<div
										key={tag}
										className="rounded-full border border-border/70 bg-surface-2/65 px-3 py-1 text-sm text-muted shadow-[0_12px_28px_-24px_rgba(48,170,255,0.7)]"
									>
										{tag}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</FadeIn>
		</Container>
	);
}
