import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<Container className="py-28 text-center">
			<p className="section-subtitle">404</p>
			<h1 className="mt-3 text-4xl font-semibold tracking-tight">Page not found</h1>
			<p className="mx-auto mt-4 max-w-xl text-muted">
				The page you are looking for does not exist. Explore the portfolio from the home page.
			</p>
			<Button asChild className="mt-8">
				<Link href="/">Back to Home</Link>
			</Button>
		</Container>
	);
}
