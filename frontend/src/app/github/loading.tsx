import { Container } from "@/components/layout/container";

export default function Loading() {
	return (
		<Container className="space-y-6 py-16 md:py-24">
			<div className="glass h-56 animate-pulse rounded-3xl" />
			<div className="glass h-14 animate-pulse rounded-2xl" />
			<div className="grid gap-5 md:grid-cols-2">
				<div className="glass h-72 animate-pulse rounded-2xl" />
				<div className="glass h-72 animate-pulse rounded-2xl" />
			</div>
		</Container>
	);
}
