"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SPLINE_SCRIPT_ID = "spline-viewer-script";
const SPLINE_SCRIPT_SRC = "https://unpkg.com/@splinetool/viewer@1.12.61/build/spline-viewer.js";
const SPLINE_SCENE_URL = "https://prod.spline.design/qlD3FB-Q1FFpnEzi/scene.splinecode";

export function HeroSplineModel() {
	const pathname = usePathname();
	const [isReady, setIsReady] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);
	const [hasRenderableSize, setHasRenderableSize] = useState(false);
	const [isInViewport, setIsInViewport] = useState(false);
	const [isPageVisible, setIsPageVisible] = useState(true);
	const [canMountViewer, setCanMountViewer] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const shouldEnableViewer = pathname === "/";

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mediaQuery = window.matchMedia("(min-width: 768px)");
		setIsDesktop(mediaQuery.matches);

		const onChange = (event: MediaQueryListEvent) => {
			setIsDesktop(event.matches);
		};

		mediaQuery.addEventListener("change", onChange);
		return () => mediaQuery.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		if (!shouldEnableViewer || !isDesktop || !isReady) {
			setHasRenderableSize(false);
			return;
		}

		const element = containerRef.current;
		if (!element || typeof window === "undefined") {
			setHasRenderableSize(false);
			return;
		}

		let frameId = 0;
		const updateRenderableState = () => {
			const rect = element.getBoundingClientRect();
			const style = window.getComputedStyle(element);
			const hasDisplay = style.display !== "none" && style.visibility !== "hidden";
			const isVisible = hasDisplay && rect.width >= 140 && rect.height >= 180;
			setHasRenderableSize(isVisible);
		};

		frameId = window.requestAnimationFrame(updateRenderableState);

		const observer = new ResizeObserver(() => {
			updateRenderableState();
		});

		observer.observe(element);
		window.addEventListener("resize", updateRenderableState);

		return () => {
			window.cancelAnimationFrame(frameId);
			observer.disconnect();
			window.removeEventListener("resize", updateRenderableState);
		};
	}, [shouldEnableViewer, isDesktop, isReady]);

	useEffect(() => {
		if (!shouldEnableViewer) {
			setIsInViewport(false);
			return;
		}

		const element = containerRef.current;
		if (!element || typeof window === "undefined") {
			setIsInViewport(false);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				setIsInViewport(entries.some((entry) => entry.isIntersecting));
			},
			{ root: null, rootMargin: "120px", threshold: 0.01 },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [shouldEnableViewer, isDesktop]);

	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const updateVisibility = () => {
			setIsPageVisible(document.visibilityState === "visible");
		};

		updateVisibility();
		document.addEventListener("visibilitychange", updateVisibility);

		return () => {
			document.removeEventListener("visibilitychange", updateVisibility);
		};
	}, []);

	useEffect(() => {
		if (!shouldEnableViewer || !isDesktop) {
			setIsReady(false);
			return;
		}

		if (typeof window === "undefined") {
			return;
		}

		if (window.customElements?.get("spline-viewer")) {
			setIsReady(true);
			return;
		}

		const existingScript = document.getElementById(SPLINE_SCRIPT_ID) as HTMLScriptElement | null;

		const handleLoad = () => {
			if (window.customElements?.get("spline-viewer")) {
				setIsReady(true);
			}
		};

		const handleError = () => {
			setIsReady(false);
		};

		if (existingScript) {
			existingScript.addEventListener("load", handleLoad);
			existingScript.addEventListener("error", handleError);
			return () => {
				existingScript.removeEventListener("load", handleLoad);
				existingScript.removeEventListener("error", handleError);
			};
		}

		const script = document.createElement("script");
		script.id = SPLINE_SCRIPT_ID;
		script.type = "module";
		script.src = SPLINE_SCRIPT_SRC;
		script.addEventListener("load", handleLoad);
		script.addEventListener("error", handleError);
		document.body.appendChild(script);

		return () => {
			script.removeEventListener("load", handleLoad);
			script.removeEventListener("error", handleError);
		};
	}, [shouldEnableViewer, isDesktop]);

	const canRenderViewer = shouldEnableViewer && isReady && hasRenderableSize && isInViewport && isPageVisible;

	useEffect(() => {
		if (!canRenderViewer || typeof window === "undefined") {
			setCanMountViewer(false);
			return;
		}

		let frameA: ReturnType<Window["requestAnimationFrame"]> | null = null;
		let frameB: ReturnType<Window["requestAnimationFrame"]> | null = null;
		let mountDelayTimer: ReturnType<Window["setTimeout"]> | null = null;

		// Delay mount until layout is stable and host is visibly renderable before WebGL bootstraps.
		frameA = window.requestAnimationFrame(() => {
			frameB = window.requestAnimationFrame(() => {
				mountDelayTimer = window.setTimeout(() => {
					const element = containerRef.current;
					if (!element) {
						setCanMountViewer(false);
						return;
					}

					const rect = element.getBoundingClientRect();
					const style = window.getComputedStyle(element);
					const hasDisplay = style.display !== "none" && style.visibility !== "hidden";
					const hasSize = rect.width >= 140 && rect.height >= 180;
					setCanMountViewer(hasDisplay && hasSize);
				}, 120);
			});
		});

		return () => {
			if (frameA !== null) {
				window.cancelAnimationFrame(frameA);
			}
			if (frameB !== null) {
				window.cancelAnimationFrame(frameB);
			}
			if (mountDelayTimer !== null) {
				window.clearTimeout(mountDelayTimer);
			}
		};
	}, [canRenderViewer]);

	useEffect(() => {
		const host = containerRef.current;

		return () => {
			if (host) {
				host.querySelectorAll("spline-viewer").forEach((node) => node.remove());
			}

			if (typeof document !== "undefined") {
				const hasAnyViewer = document.querySelector("spline-viewer");
				if (!hasAnyViewer) {
					document.getElementById(SPLINE_SCRIPT_ID)?.remove();
				}
			}
		};
	}, []);

	if (!isDesktop) {
		return null;
	}

	return (
		<div ref={containerRef} className="block h-[300px] w-full max-w-[560px] min-h-[300px] md:h-[420px] md:min-h-[420px] lg:h-[480px] lg:min-h-[480px]" aria-hidden="true">
			{canRenderViewer && canMountViewer ? (
				<spline-viewer
					url={SPLINE_SCENE_URL}
					className="block h-[300px] w-full max-w-[560px] min-h-[300px] md:h-[420px] md:min-h-[420px] lg:h-[480px] lg:min-h-[480px]"
				/>
			) : null}
		</div>
	);
}
