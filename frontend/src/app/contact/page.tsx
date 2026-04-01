import { Clock3, GitBranch, Link as LinkIcon, Mail, MapPin } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { contentRepository } from "@/lib/db/repositories";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
	title: "Contact",
	description: "Contact Kabiraj Rana for AI/ML and full-stack collaboration.",
	path: "/contact",
});

const CONTACT_EMAIL = "kabirajrana76@gmail.com";
const CONTACT_GITHUB = "https://github.com/kabirajrana";
const CONTACT_LINKEDIN = "https://www.linkedin.com/in/kabirajrana/";

export default async function ContactPage() {
	const config = await contentRepository.getContactPageConfig();
	const socialLinks = (config?.socialLinks as Record<string, unknown> | null) ?? {};
	const githubLink = CONTACT_GITHUB;
	const linkedInLink = CONTACT_LINKEDIN;
	const additionalLinks = Array.isArray(socialLinks.additional) ? (socialLinks.additional as string[]) : [];

	return (
		<Container className="py-16 md:py-24">
			<FadeIn className="relative overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(132deg,hsl(var(--background)/0.98)_0%,hsl(var(--surface)/0.94)_56%,hsl(var(--surface-2)/0.9)_100%)] p-4 sm:p-5 md:p-6">
				<div className="pointer-events-none absolute -left-8 -top-8 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
				<div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-[hsl(var(--accent-2)/0.1)] blur-3xl" aria-hidden="true" />

				<FadeIn delay={0.02} className="relative mb-5 overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(135deg,hsl(var(--background)/0.85)_0%,hsl(var(--surface)/0.72)_100%)] px-5 py-8 text-center sm:px-8 md:py-10">
					<div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/35" aria-hidden="true" />
					<div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/20" aria-hidden="true" />
					<p className="section-subtitle">Contact</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">Send a message.</h1>
					<p className="mt-3 text-base text-muted md:text-lg">Share context, constraints, and what success looks like.</p>
				</FadeIn>

				<div className="relative grid gap-5 lg:grid-cols-[1.35fr_1fr]">
					<FadeIn delay={0.04}>
						<ContactForm />
					</FadeIn>

					<div className="space-y-4">
						<FadeIn delay={0.08}>
							<section className="rounded-3xl border border-border/65 bg-[linear-gradient(135deg,hsl(var(--surface)/0.82)_0%,hsl(var(--background)/0.86)_100%)] p-5 transition-[border-color] duration-300">
								<p className="text-xs uppercase tracking-[0.28em] text-muted">Contact Details</p>
								<ul className="mt-3 space-y-2.5 text-base text-text">
									<li className="flex items-center gap-2.5 text-base text-text/92">
										<Mail size={18} className="text-muted" />
										<span>{CONTACT_EMAIL}</span>
									</li>
									<li className="flex items-center gap-2.5 text-base text-text/92">
										<MapPin size={18} className="text-muted" />
										<span>{config?.locationText ?? "Kathmandu, Nepal (or Remote)"}</span>
									</li>
									<li className="flex items-center gap-2.5 text-base text-text/92">
										<Clock3 size={18} className="text-muted" />
										<span>{config?.responseTime ?? "24–48 hours"}</span>
									</li>
								</ul>
							</section>
						</FadeIn>

						<FadeIn delay={0.12}>
							<section className="rounded-3xl border border-border/65 bg-[linear-gradient(135deg,hsl(var(--surface)/0.82)_0%,hsl(var(--background)/0.86)_100%)] p-5 transition-[border-color] duration-300">
								<p className="text-xs uppercase tracking-[0.28em] text-muted">Connect With Me</p>
								<div className="mt-4 space-y-2.5">
									{githubLink ? (
										<a
											href={githubLink}
											target="_blank"
											rel="noreferrer"
											className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/35 px-4 py-2.5 text-base text-text transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_8px_18px_-14px_hsl(var(--accent)/0.5)]"
										>
											<span className="inline-flex items-center gap-2.5">
												<GitBranch size={18} className="text-muted" />
												GitHub
											</span>
											<span className="text-muted">↗</span>
										</a>
									) : null}

									{linkedInLink ? (
										<a
											href={linkedInLink}
											target="_blank"
											rel="noreferrer"
											className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/35 px-4 py-2.5 text-base text-text transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_8px_18px_-14px_hsl(var(--accent)/0.5)]"
										>
											<span className="inline-flex items-center gap-2.5">
												<LinkIcon size={18} className="text-muted" />
												LinkedIn
											</span>
											<span className="text-muted">↗</span>
										</a>
									) : null}
									{additionalLinks.map((href) => (
										<a
											key={href}
											href={href}
											target="_blank"
											rel="noreferrer"
											className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/35 px-4 py-2.5 text-base text-text transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_8px_18px_-14px_hsl(var(--accent)/0.5)]"
										>
											<span className="inline-flex items-center gap-2.5">Additional Link</span>
											<span className="text-muted">↗</span>
										</a>
									))}
								</div>
							</section>
						</FadeIn>

						{config?.availabilityEnabled ?? true ? (
						<FadeIn delay={0.16}>
							<section className="rounded-3xl border border-border/65 bg-[linear-gradient(135deg,hsl(var(--surface)/0.82)_0%,hsl(var(--background)/0.86)_100%)] p-5 transition-[border-color] duration-300">
								<h3 className="inline-flex items-center gap-2 text-[1rem] font-semibold tracking-tight whitespace-nowrap sm:gap-2.5 sm:text-[1.2rem]">
									<span className="relative inline-flex h-2.5 w-2.5">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
										<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_0_rgba(74,222,128,0.55)]" />
									</span>
									Available for freelance projects
								</h3>
								<p className="mt-2 text-sm text-muted sm:text-[0.95rem]">Open to selected collaborations and new builds. Let’s create something exceptional.</p>
							</section>
						</FadeIn>
						) : null}
					</div>
				</div>
			</FadeIn>
		</Container>
	);
}
