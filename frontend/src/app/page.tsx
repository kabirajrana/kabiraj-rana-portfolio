import { AboutPreviewSection } from "@/components/sections/about";
import { ContactCtaSection } from "@/components/sections/contact-cta";
import { FeaturedProjectsSection } from "@/components/sections/featured-projects";
import { HeroSection } from "@/components/sections/hero";
import { SkillsSection } from "@/components/sections/skills";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
	title: "Kabiraj Rana | AI/ML Engineer",
	description:
		"Kabiraj Rana is an AI/ML engineer building production-grade AI systems, intelligent web applications, and applied machine learning projects.",
	path: "/",
	absoluteTitle: true,
});

export default async function HomePage() {
	return (
		<>
			<HeroSection />
			<AboutPreviewSection />
			<FeaturedProjectsSection />
			<SkillsSection />
			<ContactCtaSection />
		</>
	);
}
