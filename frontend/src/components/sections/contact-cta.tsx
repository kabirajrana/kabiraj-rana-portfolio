import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function ContactCtaSection() {
	return (
		<Container className="py-14 md:py-20">
			<div className="relative overflow-hidden rounded-[2rem] border border-border/65 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.1)_0%,transparent_36%),linear-gradient(150deg,hsl(var(--surface)/0.76)_0%,hsl(var(--background)/0.94)_66%,hsl(var(--background)/0.98)_100%)] px-6 py-16 md:px-10 md:py-20">
				<div
					className="pointer-events-none absolute -bottom-24 right-[14%] h-[340px] w-[340px] rounded-full border border-border/25"
					aria-hidden="true"
				/>
				<div
					className="pointer-events-none absolute -bottom-28 right-[9%] h-[460px] w-[460px] rounded-full border border-border/20"
					aria-hidden="true"
				/>

				<div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
					<FadeIn y={10} durationMs={920} className="w-full">
						<p className="text-[0.7rem] font-medium uppercase tracking-[0.38em] text-muted/85">Get in touch</p>
					</FadeIn>
					<h2 className="mt-4 max-w-4xl text-[1.72rem] font-semibold leading-[1.14] tracking-tight text-text/88 [text-wrap:balance] sm:text-[1.95rem] md:mt-5 md:text-5xl md:leading-[1.03]">
						<FadeIn delay={0.16} y={14} durationMs={980} className="block">Ready to build</FadeIn>
						<FadeIn delay={0.32} y={14} durationMs={980} className="block">something intelligent</FadeIn>
					</h2>
					<FadeIn delay={0.46} y={12} durationMs={940} className="w-full">
						<p className="mt-6 max-w-3xl text-base leading-[1.75] text-muted/90 [text-wrap:pretty] md:text-[1.06rem]">
							If you’re building an AI/ML product, a scalable data platform, or a modern web application —
							define the goal and timeline, and let’s execute with precision.
						</p>
					</FadeIn>
					<FadeIn delay={0.58} y={10} durationMs={900} className="w-full">
						<div className="mt-6 h-px w-28 bg-gradient-to-r from-transparent via-border/85 to-transparent" />
					</FadeIn>

					<FadeIn delay={0.7} y={12} durationMs={960} className="w-full">
						<Button
							asChild
							variant="outline"
							className="group mt-10 h-14 rounded-full border-border/80 bg-[linear-gradient(138deg,hsl(var(--surface)/0.84)_0%,hsl(var(--background)/0.92)_100%)] px-7 text-sm font-semibold tracking-[0.06em] text-text/95 shadow-[0_16px_34px_-24px_hsl(var(--accent)/0.65)] transition-[transform,border-color,background-color,box-shadow,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent/45 hover:bg-[linear-gradient(138deg,hsl(var(--surface)/0.92)_0%,hsl(var(--background)/0.96)_100%)] hover:text-text hover:shadow-[0_22px_44px_-24px_hsl(var(--accent)/0.58)]"
						>
							<Link
								href="/contact"
								className="inline-flex items-center gap-2"
							>
								<span>Send a message</span>
								<span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
									→
								</span>
							</Link>
						</Button>
					</FadeIn>
				</div>
			</div>
		</Container>
	);
}
