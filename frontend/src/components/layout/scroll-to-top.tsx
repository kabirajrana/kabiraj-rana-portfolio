"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

const SHOW_AFTER_SCROLL_Y = 240;

export function ScrollToTopButton() {
	const [isVisible, setIsVisible] = useState(false);
	const frameId = useRef<number | null>(null);
	const ticking = useRef(false);

	useEffect(() => {
		const onScroll = () => {
			if (ticking.current) {
				return;
			}

			ticking.current = true;
			frameId.current = window.requestAnimationFrame(() => {
				setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_Y);
				ticking.current = false;
				frameId.current = null;
			});
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (frameId.current !== null) {
				window.cancelAnimationFrame(frameId.current);
			}
		};
	}, []);

	return (
		<button
			type="button"
			aria-label="Scroll to top"
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			className={cn(
				"fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-surface/80 text-text shadow-soft backdrop-blur-xl",
				"transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-surface-2 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
				isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
			)}
		>
			<ArrowUp size={18} />
		</button>
	);
}
