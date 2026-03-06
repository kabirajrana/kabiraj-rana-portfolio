import { Skill } from "@/types/site";

export function SkillCard({ skill }: { skill: Skill }) {
	return (
		<div className="rounded-xl border border-border/80 bg-surface/70 p-4">
			<div className="mb-2 flex items-center justify-between text-sm">
				<span>{skill.name}</span>
				<span className="text-muted">{skill.level}%</span>
			</div>
			<div className="h-2 w-full rounded-full bg-surface-2">
				<div className="h-2 rounded-full bg-accent" style={{ width: `${skill.level}%` }} aria-hidden="true" />
			</div>
		</div>
	);
}
