import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

import { navItems } from "@/content/site/nav";
import { socialLinks } from "@/content/site/socials";

import { Container } from "./container";

export function Footer() {
	const importantLinks = navItems.filter((item) => ["/", "/about", "/projects", "/contact"].includes(item.href));

	const socialIcon = (label: string) => {
		const normalized = label.toLowerCase();
		if (normalized.includes("github")) {
			return <Github size={17} />;
		}
		if (normalized.includes("linkedin")) {
			return <Linkedin size={17} />;
		}
		return <Mail size={17} />;
	};

	return (
		<footer className="mt-14 border-t border-border/60 bg-[linear-gradient(180deg,hsl(var(--surface)/0.22)_0%,transparent_70%)] py-8 md:py-10">
			<Container>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)_minmax(0,0.9fr)] lg:gap-12">
					<div className="lg:pr-8">
						<div className="flex items-center gap-3">
							<div className="relative h-11 w-11 overflow-hidden rounded-xl border border-border/75 bg-[linear-gradient(145deg,hsl(var(--surface)/0.85)_0%,hsl(var(--surface-2)/0.72)_100%)] shadow-[0_10px_24px_-18px_hsl(var(--accent)/0.55)]">
								<Image
									src="/images/logo.png"
									alt="Kabiraj Rana logo"
									fill
									className="object-contain p-[0.34rem]"
									sizes="44px"
								/>
							</div>
							<p className="text-xl font-semibold tracking-tight md:text-[1.35rem]">Kabiraj Rana</p>
						</div>
						<p className="mt-2.5 max-w-[30rem] text-[0.92rem] leading-relaxed text-muted/92 md:text-[0.98rem]">
							<span className="block">
								<span className="text-accent">Aspiring AI/ML Engineer</span>
								<span> • Full-Stack Developer</span>
							</span>
							<span className="block">Applied Machine Learning Builder</span>
						</p>
					</div>

					<div className="hidden md:block">
						<p className="text-xs font-semibold uppercase tracking-[0.34em] text-muted">Quick Links</p>
						<div className="mt-3.5 flex flex-col gap-2 text-sm text-text/92 md:text-base">
							{importantLinks.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="relative w-fit transition-colors duration-300 hover:text-text after:pointer-events-none after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-center after:scale-x-0 after:bg-accent/85 after:opacity-90 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100"
								>
									{item.label}
								</Link>
							))}
						</div>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.34em] text-muted">Connect</p>
						<div className="mt-3.5 flex items-center gap-2">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noreferrer"
									aria-label={social.label}
									className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-surface/45 text-muted transition-[transform,border-color,color,background-color] duration-400 hover:-translate-y-0.5 hover:border-border hover:bg-surface/65 hover:text-text"
								>
									{socialIcon(social.label)}
								</a>
							))}
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col items-center gap-1 border-t border-border/60 pt-4 text-center text-xs text-muted/90 md:mt-9 md:flex-row md:items-center md:justify-between md:text-left md:text-sm">
					<p>© 2026 Kabiraj Rana. All rights reserved.</p>
					<p>Build with modern AI stack</p>
				</div>
			</Container>
		</footer>
	);
}
