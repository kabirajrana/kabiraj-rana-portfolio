import { Container } from "@/components/layout/container";

export default function ExperienceLoading() {
	return (
		<Container className="pt-16 md:pt-24">
			<div className="mx-auto max-w-6xl">
				<div className="rounded-3xl border border-border/60 bg-surface/50 p-6 md:p-8">
					<div className="h-3 w-40 animate-pulse rounded-full bg-cyan-500/40" />
					<div className="mt-5 h-8 w-full max-w-3xl animate-pulse rounded-full bg-foreground/10" />
					<div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-foreground/10" />

					<div className="mt-8 grid gap-4 md:grid-cols-2">
						<div className="h-56 animate-pulse rounded-2xl border border-border/60 bg-background/40" />
						<div className="h-56 rounded-2xl border border-border/60 bg-background/40 p-5">
							<div className="h-4 w-full animate-pulse rounded-full bg-foreground/10" />
							<div className="mt-3 h-4 w-5/6 animate-pulse rounded-full bg-foreground/10" />
							<div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-foreground/10" />
							<div className="mt-6 h-3 w-full animate-pulse rounded-full bg-foreground/10" />
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
}
