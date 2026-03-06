import { AboutPreviewSection } from "@/components/sections/about";
import { ContactCtaSection } from "@/components/sections/contact-cta";
import { FeaturedProjectsSection } from "@/components/sections/featured-projects";
import { HeroSection } from "@/components/sections/hero";
import { SkillsSection } from "@/components/sections/skills";
import { buildMetadata } from "@/lib/seo";
import { contentRepository } from "@/lib/db/repositories";

export const metadata = buildMetadata({
	title: "Home",
	description: "Portfolio of Kabiraj Rana, AI/ML-focused full-stack engineer.",
	path: "/",
});

export default async function HomePage() {
	const settings = await contentRepository.getSystemSettings();

	return (
		<>
			<HeroSection />
			<AboutPreviewSection />
			{settings?.enableProjects ?? true ? <FeaturedProjectsSection /> : null}
			<SkillsSection />
			<ContactCtaSection />
		</>
	);
}
