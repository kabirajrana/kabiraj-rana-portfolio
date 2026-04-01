"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function FadeIn({
	children,
	delay = 0,
	y = 24,
	durationMs = 1160,
	easing = "cubic-bezier(0.22,1,0.36,1)",
	className,
}: {
	children: ReactNode;
	delay?: number;
	y?: number;
	durationMs?: number;
	easing?: string;
	className?: string;
}) {
	const elementRef = useRef<HTMLDivElement | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) {
			return;
		}

		if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
			setIsVisible(true);
			return;
		}

		const rect = element.getBoundingClientRect();
		const appearsOnInitialViewport = rect.top <= window.innerHeight * 1.05;
		if (appearsOnInitialViewport) {
			const id = window.requestAnimationFrame(() => setIsVisible(true));
			return () => window.cancelAnimationFrame(id);
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{
				threshold: 0.1,
				rootMargin: "0px 0px 12% 0px",
			}
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={elementRef}
			className={cn("transition-[opacity,transform]", className)}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0px)" : `translateY(${y}px)`,
				transitionDelay: `${Math.max(0, delay) * 1000}ms`,
				transitionDuration: `${Math.max(420, durationMs)}ms`,
				transitionTimingFunction: easing,
			}}
		>
			{children}
		</div>
	);
}
