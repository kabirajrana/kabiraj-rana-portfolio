"use client";

import { useEffect, useRef, useState } from "react";

const SPLINE_SCRIPT_ID = "spline-viewer-script";
const SPLINE_SCRIPT_SRC = "https://unpkg.com/@splinetool/viewer@1.12.61/build/spline-viewer.js";
const SPLINE_SCENE_URL = "https://prod.spline.design/qlD3FB-Q1FFpnEzi/scene.splinecode";

export function HeroSplineModel() {
	const [isReady, setIsReady] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);
	const [hasRenderableSize, setHasRenderableSize] = useState(false);
	const [isInViewport, setIsInViewport] = useState(false);
	const [isPageVisible, setIsPageVisible] = useState(true);
	const [canMountViewer, setCanMountViewer] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

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
		if (!isDesktop || !isReady) {
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
			const isVisible = rect.width >= 140 && rect.height >= 180;
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
	}, [isDesktop, isReady]);

	useEffect(() => {
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
	}, [isDesktop]);

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
		if (!isDesktop) {
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
	}, [isDesktop]);

	const canRenderViewer = isReady && hasRenderableSize && isInViewport && isPageVisible;

	useEffect(() => {
		if (!canRenderViewer || typeof window === "undefined") {
			setCanMountViewer(false);
			return;
		}

		let frameA = 0;
		let frameB = 0;

		// Delay mount by two frames so custom element layout is stable before WebGL bootstraps.
		frameA = window.requestAnimationFrame(() => {
			frameB = window.requestAnimationFrame(() => {
				const element = containerRef.current;
				if (!element) {
					setCanMountViewer(false);
					return;
				}

				const rect = element.getBoundingClientRect();
				setCanMountViewer(rect.width > 0 && rect.height > 0);
			});
		});

		return () => {
			window.cancelAnimationFrame(frameA);
			window.cancelAnimationFrame(frameB);
		};
	}, [canRenderViewer]);

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
