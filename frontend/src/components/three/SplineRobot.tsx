"use client";

import { createElement, useEffect, useRef, useState } from "react";

const SPLINE_SCENE_URL = "https://prod.spline.design/1nGELt90Ctj6SEhD/scene.splinecode";
const SPLINE_VIEWER_SCRIPT_URL = "https://unpkg.com/@splinetool/viewer@1.12.61/build/spline-viewer.js";
const SPLINE_SCRIPT_ID = "spline-viewer-web-component-script";

export default function SplineRobot() {
  const [viewerReady, setViewerReady] = useState(false);
  const [hasStageSize, setHasStageSize] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (customElements.get("spline-viewer")) {
      setViewerReady(true);
      return;
    }

    const onScriptLoad = () => setViewerReady(true);
    const existingScript = document.getElementById(SPLINE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", onScriptLoad, { once: true });
      return () => existingScript.removeEventListener("load", onScriptLoad);
    }

    const script = document.createElement("script");
    script.id = SPLINE_SCRIPT_ID;
    script.type = "module";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = SPLINE_VIEWER_SCRIPT_URL;
    script.addEventListener("load", onScriptLoad, { once: true });
    document.head.appendChild(script);

    return () => script.removeEventListener("load", onScriptLoad);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stage = stageRef.current;
    if (!stage) return;

    const updateStageSize = () => {
      const rect = stage.getBoundingClientRect();
      setHasStageSize(rect.width > 1 && rect.height > 1);
    };

    updateStageSize();
    const frameId = window.requestAnimationFrame(updateStageSize);
    const observer = new ResizeObserver(updateStageSize);
    observer.observe(stage);
    window.addEventListener("orientationchange", updateStageSize);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("orientationchange", updateStageSize);
    };
  }, []);

  return (
    <div
      data-spline-wrapper="true"
      className="pointer-events-auto mx-auto flex w-full items-center justify-center"
      aria-label="Interactive robot model"
      role="img"
    >
      <div className="spline-shell relative h-[280px] w-full overflow-hidden rounded-2xl bg-transparent sm:h-[340px] md:h-[430px] lg:h-[500px] xl:h-[560px]">
        <div ref={stageRef} className="spline-stage h-full w-full origin-center scale-[0.72] sm:scale-[0.76] md:scale-[0.8] lg:scale-[0.84] xl:scale-[0.88]">
          {viewerReady && hasStageSize ? (
            createElement("spline-viewer", {
              url: SPLINE_SCENE_URL,
              className: "spline-viewer-embed",
            })
          ) : (
            <div className="spline-viewer-embed" />
          )}
        </div>
      </div>
    </div>
  );
}
