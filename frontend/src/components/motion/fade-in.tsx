"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function FadeIn({
	children,
	delay = 0,
	y = 20,
	className,
}: {
	children: ReactNode;
	delay?: number;
	y?: number;
	className?: string;
}) {
	const elementRef = useRef<HTMLDivElement | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.25 }
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={elementRef}
			className={cn("transition-[opacity,transform] duration-500 ease-out", className)}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0px)" : `translateY(${y}px)`,
				transitionDelay: `${Math.max(0, delay) * 1000}ms`,
			}}
		>
			{children}
		</div>
	);
}
