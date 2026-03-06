"use client";

import { useEffect, useState } from "react";

const SPLINE_SCRIPT_ID = "spline-viewer-script";
const SPLINE_SCRIPT_SRC = "https://unpkg.com/@splinetool/viewer@1.12.61/build/spline-viewer.js";
const SPLINE_SCENE_URL = "https://prod.spline.design/qlD3FB-Q1FFpnEzi/scene.splinecode";

export function HeroSplineModel() {
	const [isReady, setIsReady] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);

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

	if (!isDesktop) {
		return null;
	}

	if (!isReady) {
		return <div className="h-[300px] w-full max-w-[560px] md:h-[420px]" aria-hidden="true" />;
	}

	return (
		<spline-viewer
			url={SPLINE_SCENE_URL}
			className="h-[300px] w-full max-w-[560px] md:h-[420px]"
		/>
	);
}
