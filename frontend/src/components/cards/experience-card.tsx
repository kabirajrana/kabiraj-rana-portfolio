import { ExperienceItem } from "@/types/site";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExperienceCard({
	item,
	align = "left",
}: {
	item: ExperienceItem;
	align?: "left" | "right";
}) {
	return (
		<Card
			data-align={align}
			className={cn(
				"rounded-2xl border-border/70 bg-card/80 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.55)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35"
			)}
		>
			<CardHeader className="space-y-2.5 pb-2.5">
				<div className="flex flex-wrap items-center gap-2">
					<span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
						{item.period}
					</span>
				</div>
				<div className="space-y-1.5">
					<CardTitle className="text-lg font-semibold tracking-tight text-foreground sm:text-[1.55rem]">
						{item.title}
					</CardTitle>
					<p className="text-sm font-medium text-accent">{item.organization}</p>
					{item.summary ? (
						<p className="text-sm leading-relaxed text-muted">{item.summary}</p>
					) : null}
				</div>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				<ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
					{item.bullets.map((bullet) => (
						<li key={bullet}>{bullet}</li>
					))}
				</ul>
				{item.tags?.length ? (
					<div className="flex flex-wrap gap-2">
						{item.tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted"
							>
								{tag}
							</span>
						))}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
