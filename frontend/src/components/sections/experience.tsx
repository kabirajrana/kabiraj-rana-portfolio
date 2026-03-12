"use client";

import { useMemo, useState } from "react";

import { ExperienceCard } from "@/components/cards/experience-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";
import type { CertificationItem, ExperienceItem } from "@/types/site";

export function ExperienceSection({
	experiences,
	certificates,
	certifications,
	showTimeline,
	showCertifications,
	certTitle,
	certSubtitle,
}: {
	experiences: ExperienceItem[];
	certificates: CertificationItem[];
	certifications: CertificationItem[];
	showTimeline: boolean;
	showCertifications: boolean;
	certTitle: string;
	certSubtitle: string;
}) {
	const [activeCredentialTab, setActiveCredentialTab] = useState<"certificate" | "certification">("certificate");

	const activeCredentials = useMemo(
		() => (activeCredentialTab === "certificate" ? certificates : certifications),
		[activeCredentialTab, certificates, certifications]
	);

	const credentialHeading = activeCredentialTab === "certificate" ? "Certificates" : certTitle;
	const credentialSubtext =
		activeCredentialTab === "certificate"
			? "Selected certificates and verified learning milestones."
			: certSubtitle;

	return (
		<Container className="pb-14 md:pb-20">
			{showTimeline ? (
			<div className="relative mt-10 md:mt-14">
				<div className="absolute left-4 top-0 h-full w-px bg-border/70 md:left-1/2 md:-translate-x-1/2" />

				<div className="space-y-8 md:space-y-10">
					{experiences.map((item, idx) => {
						const isRight = item.sidePlacement === "RIGHT" ? true : item.sidePlacement === "LEFT" ? false : idx % 2 === 1;

						return (
							<FadeIn key={`${item.title}-${item.period}`} delay={idx * 0.08}>
								<div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6">
									<div className={isRight ? "hidden md:block" : "hidden md:block md:pr-1"}>
										{!isRight ? (
											<div className="md:ml-auto md:max-w-[520px]">
												<ExperienceCard item={item} align="left" />
											</div>
										) : null}
									</div>

									<div className="relative flex items-start justify-start md:justify-center">
										<div className="absolute left-4 top-6 h-[calc(100%+2.5rem)] w-px bg-border/70 md:left-1/2 md:-translate-x-1/2" />
										<span className="relative z-10 mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-background text-sm text-primary shadow-[0_0_0_6px_hsl(var(--background))]">
											✦
										</span>
									</div>

									<div className={isRight ? "md:block md:pl-1" : "hidden md:block"}>
										{isRight ? (
											<div className="md:mr-auto md:max-w-[520px]">
												<ExperienceCard item={item} align="right" />
											</div>
										) : null}
									</div>

									<div className="md:hidden">
										<ExperienceCard item={item} align="left" />
									</div>
								</div>
							</FadeIn>
						);
					})}
				</div>
			</div>
			) : null}

			{showCertifications ? (
			<FadeIn delay={0.2} className="mt-16 md:mt-20">
				<div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-[0_14px_44px_-26px_rgba(0,0,0,0.55)] backdrop-blur md:p-8">
					<div className="inline-flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
						<button
							type="button"
							onClick={() => setActiveCredentialTab("certificate")}
							className={`rounded-full px-3 py-1 transition-all duration-300 ${
								activeCredentialTab === "certificate"
									? "border border-primary/60 bg-primary text-primary-foreground shadow-[0_10px_26px_-14px_hsl(var(--primary)/0.95),inset_0_1px_0_hsl(var(--primary-foreground)/0.2)]"
									: "border border-primary/35 bg-primary/10 text-primary/90 shadow-[0_10px_24px_-18px_hsl(var(--primary)/0.7),inset_0_1px_0_hsl(var(--primary)/0.24)] hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/16 hover:text-primary"
							}`}
						>
							Certificates
						</button>
						<button
							type="button"
							onClick={() => setActiveCredentialTab("certification")}
							className={`rounded-full px-3 py-1 transition-all duration-300 ${
								activeCredentialTab === "certification"
									? "border border-primary/60 bg-primary text-primary-foreground shadow-[0_10px_26px_-14px_hsl(var(--primary)/0.95),inset_0_1px_0_hsl(var(--primary-foreground)/0.2)]"
									: "border border-primary/35 bg-primary/10 text-primary/90 shadow-[0_10px_24px_-18px_hsl(var(--primary)/0.7),inset_0_1px_0_hsl(var(--primary)/0.24)] hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/16 hover:text-primary"
							}`}
						>
							Certifications
						</button>
					</div>
					<h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
						{credentialHeading}
					</h3>
					<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
						{credentialSubtext}
					</p>

					<div className="mt-6 grid gap-3 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3">
						{activeCredentials.map((item, idx) => (
							<FadeIn key={item.id} delay={0.08 + idx * 0.08}>
								<div className="group rounded-xl border border-border/70 bg-background/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_34px_-24px_hsl(var(--primary))]">
									<p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.1),0_10px_24px_-16px_hsl(var(--primary)/0.8)]">
										{item.codeLabel ?? item.id}
									</p>
									<p className="mt-2 text-sm font-medium leading-relaxed text-foreground sm:text-[0.95rem]">
										{item.title}
									</p>
									<a
										href={item.href}
										target="_blank"
										rel="noreferrer noopener"
										className="mt-3 inline-block text-xs text-muted transition-colors hover:text-primary group-hover:text-primary"
									>
										View Credential ↗
									</a>
								</div>
							</FadeIn>
						))}
					</div>
				</div>
			</FadeIn>
			) : null}

			<FadeIn delay={0.24} className="mt-8 text-center">
				<p className="text-lg italic text-muted/90 sm:text-xl">The journey continues...</p>
			</FadeIn>
		</Container>
	);
}
