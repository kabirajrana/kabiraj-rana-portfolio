import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { ExperienceSection } from "@/components/sections/experience";
import { experiences as fallbackExperiences } from "@/content/site/experience";
import { contentRepository } from "@/lib/db/repositories";
import { buildMetadata } from "@/lib/seo";

type ExperienceRow = Awaited<ReturnType<typeof contentRepository.listExperience>>[number];
type CertificationRow = Awaited<ReturnType<typeof contentRepository.listCertifications>>[number];

function normalizeCredentialType(value: unknown): "certificate" | "certification" {
	return String(value ?? "").trim().toLowerCase() === "certificate" ? "certificate" : "certification";
}

export const metadata = buildMetadata({
	title: "Experience",
	description: "Experience timeline, education, and certifications of Kabiraj Rana.",
	path: "/experience",
});

export default async function ExperiencePage() {
	const [config, experienceRows, credentials] = await Promise.all([
		contentRepository.getExperiencePageConfig(),
		contentRepository.listExperience(),
		contentRepository.listCertifications(),
	]);

	const mappedExperience = (experienceRows as ExperienceRow[])
		.filter((item: ExperienceRow) => item.status === "PUBLISHED")
		.map((item: ExperienceRow) => ({
			title: item.role,
			period: item.timeframe || `${item.startDate.getFullYear()} – ${item.currentRole ? "Present" : item.endDate ? item.endDate.getFullYear() : "Present"}`,
			organization: item.org,
			summary: item.summary ?? undefined,
			tags: Array.isArray(item.techStack) ? (item.techStack as string[]) : [],
			bullets: Array.isArray(item.achievements) ? (item.achievements as string[]) : [],
			sidePlacement: item.sidePlacement,
		}));

	const typedCredentials = credentials as CertificationRow[];

	const mappedCerts = typedCredentials.filter((item: CertificationRow) => normalizeCredentialType((item as { type?: unknown }).type) === "certification").map((item: CertificationRow) => ({
		id: item.id,
		codeLabel: item.codeLabel,
		title: item.title,
		href: item.credentialUrl,
	}));

	const mappedCertificates = typedCredentials.filter((item: CertificationRow) => normalizeCredentialType((item as { type?: unknown }).type) === "certificate").map((item: CertificationRow) => ({
		id: item.id,
		codeLabel: item.codeLabel,
		title: item.title,
		href: item.credentialUrl,
	}));

	const timelineItems = mappedExperience.length > 0 ? mappedExperience : fallbackExperiences;
	const certificateItems = mappedCertificates;
	const certificationItems = mappedCerts;

	return (
		<>
			<Container className="pt-16 md:pt-24">
				<FadeIn className="mx-auto max-w-3xl text-center">
					<p className="section-subtitle justify-center">{config?.smallLabel ?? "EXPERIENCE"}</p>
					<h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
						{config?.title ?? "A journey of learning, iteration, and creation."}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
						{config?.subtitle ??
							"From focused self-learning to full-stack delivery, each step reflects consistent growth, practical execution, and deeper technical craftsmanship."}
					</p>
				</FadeIn>
			</Container>
			<ExperienceSection
				experiences={timelineItems}
				certificates={certificateItems}
				certifications={certificationItems}
				showTimeline={config?.showTimeline ?? true}
				showCertifications={config?.showCertifications ?? true}
				certTitle={config?.certTitle ?? "Formal Intelligence Expansion"}
				certSubtitle={config?.certSubtitle ?? "Each certification reflects practical upskilling across AI, cloud, and modern software systems."}
			/>
		</>
	);
}
