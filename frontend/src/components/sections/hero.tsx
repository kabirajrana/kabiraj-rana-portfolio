import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";
import { HeroSplineModel } from "@/components/sections/hero-spline";
import { Button } from "@/components/ui/button";

export function HeroSection() {
	return (
		<Container className="grid items-center gap-5 py-7 sm:py-9 md:grid-cols-2 md:gap-8 md:py-16">
			<FadeIn className="space-y-4 text-center sm:space-y-5 md:space-y-6 md:text-left">
				<p className="text-xs uppercase tracking-[0.35em] text-muted md:text-sm">Hello, I&apos;m</p>
				<h1 className="text-[2.15rem] font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					Kabiraj Rana
				</h1>
				<p className="mx-auto max-w-3xl text-center text-[1.02rem] font-semibold leading-snug text-accent-foreground/90 md:mx-0 md:text-left md:text-[1.14rem]">
					<span className="text-[#30B4C4] font-bold">AI/ML Engineer</span>
					<span className="mx-1.5 text-accent-foreground/80">&bull;</span>
					<span>Production-Grade AI Systems</span>
					<span className="mx-1.5 text-accent-foreground/80">&bull;</span>
					<span>Intelligent Web Applications</span>
				</p>
				<p className="mx-auto max-w-2xl text-center text-[0.95rem] leading-relaxed text-muted-foreground sm:text-[1rem] md:mx-0 md:text-left md:text-[1.03rem]">
					I build production-grade AI systems, intelligent web applications, and applied machine learning projects.
				</p>
				<div className="mx-auto flex w-full max-w-md items-center justify-center gap-3 md:mx-0 md:max-w-none md:justify-start md:gap-3.5">
					<Button
						asChild
						size="sm"
						className="h-8 w-[8.85rem] rounded-full px-3 text-[0.76rem] font-medium shadow-soft transition-transform duration-200 hover:-translate-y-0.5 sm:h-10 sm:w-[10.75rem] sm:px-5 sm:text-sm md:h-11 md:w-[11.25rem] md:px-6"
					>
						<Link href="/projects">Explore Work &rarr;</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="sm"
						className="h-8 w-[8.85rem] rounded-full px-3 text-[0.76rem] font-medium shadow-soft transition-transform duration-200 hover:-translate-y-0.5 sm:h-10 sm:w-[10.75rem] sm:px-5 sm:text-sm md:h-11 md:w-[11.25rem] md:px-6"
					>
						<Link href="/contact">Get in Touch</Link>
					</Button>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
					<div className="hidden h-px w-12 bg-border sm:block" />
					<p className="max-w-[18rem] text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted sm:max-w-none sm:text-xs md:text-xs">
						Product-Mindset &bull; Craft &bull; Applied ML
					</p>
				</div>
			</FadeIn>

			<FadeIn delay={0.1} className="relative hidden md:block">
				<div className="relative h-[320px] overflow-hidden md:h-[420px] lg:h-[480px]">
					<div className="relative flex h-full items-end justify-center">
						<HeroSplineModel />
					</div>
				</div>
			</FadeIn>
		</Container>
	);
}
