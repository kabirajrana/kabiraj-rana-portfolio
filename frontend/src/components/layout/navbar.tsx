"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Menu, X } from "lucide-react";

import { navItems } from "@/content/site/nav";
import { cn } from "@/lib/utils";

import { Container } from "./container";
import { Button } from "@/components/ui/button";

export function Navbar() {
	const pathname = usePathname();
	const [isVisible, setIsVisible] = useState(true);
	const [isAtTop, setIsAtTop] = useState(true);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const lastScrollY = useRef(0);
	const scrollAccumulator = useRef(0);
	const frameId = useRef<number | null>(null);
	const ticking = useRef(false);

	useEffect(() => {
		const TOP_OFFSET = 24;
		const HIDE_OFFSET = 96;
		const DIRECTION_THRESHOLD = 18;

		lastScrollY.current = window.scrollY;
		setIsAtTop(window.scrollY < TOP_OFFSET);

		const onScroll = () => {
			const currentY = window.scrollY;

			if (ticking.current) {
				return;
			}

			ticking.current = true;
			frameId.current = window.requestAnimationFrame(() => {
				const previousY = lastScrollY.current;
				const deltaY = currentY - previousY;
				const nearTop = currentY < TOP_OFFSET;

				setIsAtTop(nearTop);

				if (nearTop) {
					setIsVisible(true);
					scrollAccumulator.current = 0;
				} else if (deltaY !== 0) {
					if (
						(deltaY > 0 && scrollAccumulator.current < 0) ||
						(deltaY < 0 && scrollAccumulator.current > 0)
					) {
						scrollAccumulator.current = 0;
					}

					scrollAccumulator.current += deltaY;

					if (scrollAccumulator.current >= DIRECTION_THRESHOLD && currentY > HIDE_OFFSET) {
						setIsVisible(false);
						scrollAccumulator.current = 0;
					} else if (scrollAccumulator.current <= -DIRECTION_THRESHOLD) {
						setIsVisible(true);
						scrollAccumulator.current = 0;
					}
				}

				lastScrollY.current = currentY;
				ticking.current = false;
				frameId.current = null;
			});
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (frameId.current !== null) {
				window.cancelAnimationFrame(frameId.current);
			}
		};
	}, []);

	useEffect(() => {
		setIsMenuOpen(false);
	}, [pathname]);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4 transform-gpu transition-[transform,opacity] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] will-change-transform",
				isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
			)}
		>
			<Container>
				<div className="relative">
					<div
						className={cn(
							"glass flex h-14 items-center justify-between rounded-full px-3 shadow-soft transition-opacity duration-300 sm:h-16 sm:px-4 md:px-6",
							isAtTop ? "opacity-100" : "opacity-95"
						)}
					>
						<Link
							href="/"
							aria-label="Kabiraj Rana Home"
							className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-surface-2 transition-[border-color,box-shadow,background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.22),0_0_24px_-10px_hsl(var(--accent)/0.55)] sm:h-11 sm:w-11"
						>
							<Image
								src="/images/logo.png"
								alt="Kabiraj Rana Logo"
								width={30}
								height={30}
								priority
								style={{ width: "auto", height: "auto" }}
							/>
						</Link>

						<nav className="hidden items-center gap-2 md:-mr-2 md:flex" aria-label="Main">
							{navItems.map((item) => {
								const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
											active && "text-text underline decoration-accent/90 decoration-[1px] underline-offset-[8px]"
										)}
									>
										{item.label}
									</Link>
								);
							})}
						</nav>

						<Button
							asChild
							size="sm"
							variant="outline"
							className="hidden h-9 rounded-full border border-border/42 bg-[linear-gradient(140deg,hsl(var(--surface)/0.9)_0%,hsl(var(--background)/0.95)_100%)] px-4 text-xs font-semibold text-text/82 shadow-[0_5px_10px_-12px_hsl(var(--accent)/0.2)] transition-[border-color,background-color,transform,box-shadow,color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-border/62 hover:bg-[linear-gradient(140deg,hsl(var(--surface)/0.95)_0%,hsl(var(--background)/0.98)_100%)] hover:text-text/86 hover:shadow-[0_8px_14px_-12px_hsl(var(--accent)/0.24)] md:inline-flex"
						>
							<a href="/kabiraj-rana-cv.pdf" download>
								<span className="inline-flex items-center gap-1 tracking-[0.08em]">
									<ArrowDown size={12} />
									Download CV
								</span>
							</a>
						</Button>

						<button
							type="button"
							aria-label="Toggle menu"
							aria-expanded={isMenuOpen}
							onClick={() => setIsMenuOpen((value) => !value)}
							className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-surface-2 text-text transition-[border-color,background-color,color] duration-300 hover:border-border hover:bg-surface sm:h-11 sm:w-11 md:hidden"
						>
							{isMenuOpen ? <X size={19} /> : <Menu size={19} />}
						</button>
					</div>

					<div
						className={cn(
							"absolute inset-x-1 top-[3.85rem] rounded-2xl border border-border/65 bg-surface/95 p-3 shadow-soft backdrop-blur-xl transition-[opacity,transform] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:inset-x-2 sm:top-[4.35rem] md:hidden",
							isMenuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
						)}
					>
						<nav className="flex flex-col gap-1" aria-label="Mobile Main">
							{navItems.map((item, index) => {
								const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-[opacity,transform,color] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:text-text",
											active && "text-text"
										)}
										style={{
											opacity: isMenuOpen ? 1 : 0,
											transform: isMenuOpen ? "translateY(0px)" : "translateY(-4px)",
											transitionDelay: `${index * 60}ms`,
										}}
									>
										{item.label}
									</Link>
								);
							})}
								<Button asChild variant="outline" size="sm" className="mt-2 h-10 rounded-xl">
									<a href="/kabiraj-rana-cv.pdf" download>
										<span className="inline-flex items-center gap-1">
											<ArrowDown size={14} />
											Download CV
										</span>
									</a>
								</Button>
						</nav>
					</div>
				</div>
			</Container>
		</header>
	);
}
