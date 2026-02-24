"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

const SPLINE_SCENE_URL = "https://prod.spline.design/70LNndbYpuGiiTDU/scene.splinecode";

export default function SplineRobot() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tiltLayerRef = useRef<HTMLDivElement | null>(null);

  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const inViewRef = useRef(true);
  const pageVisibleRef = useRef(true);

  const [mounted, setMounted] = useState(false);
  const [hasValidSize, setHasValidSize] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Prevents zero-size WebGL initialization in production by waiting for real measured dimensions.
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);

      setHasValidSize(width > 32 && height > 32);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    const tiltLayer = tiltLayerRef.current;
    if (!element || !tiltLayer) return;

    const cancelLoop = () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const canAnimate = () => inViewRef.current && pageVisibleRef.current;

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;

      targetXRef.current = -ny * 4.2;
      targetYRef.current = nx * 5.4;
    };

    const onLeave = () => {
      targetXRef.current = 0;
      targetYRef.current = 0;
    };

    const tick = () => {
      if (!canAnimate()) {
        cancelLoop();
        return;
      }

      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.08;
      currentYRef.current += (targetYRef.current - currentYRef.current) * 0.08;

      tiltLayer.style.transform = `perspective(1000px) rotateX(${currentXRef.current.toFixed(2)}deg) rotateY(${currentYRef.current.toFixed(2)}deg)`;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafRef.current || !canAnimate()) return;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      pageVisibleRef.current = !document.hidden;
      if (canAnimate()) startLoop();
      else cancelLoop();
    };

    const intersection = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        inViewRef.current = entry.isIntersecting;
        if (canAnimate()) startLoop();
        else cancelLoop();
      },
      { threshold: 0.08 }
    );

    intersection.observe(element);
    document.addEventListener("visibilitychange", onVisibilityChange);

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    startLoop();

    return () => {
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      cancelLoop();
    };
  }, []);

  return (
    <div className="pointer-events-auto mx-auto flex w-full items-center justify-center md:max-w-[520px]">
      {/* Explicit heights avoid implicit h-full chains that can become zero in production layout timing. */}
      <div
        ref={containerRef}
        className="relative h-[300px] w-full overflow-hidden rounded-2xl bg-transparent sm:h-[380px] md:h-[520px] lg:h-[620px] xl:h-[700px]"
      >
        <div ref={tiltLayerRef} className="absolute inset-0 will-change-transform">
          {mounted && hasValidSize ? (
            <Spline scene={SPLINE_SCENE_URL} className="h-full w-full" />
          ) : (
            <div className="h-full w-full rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_55%_35%,rgba(110,231,255,0.18),transparent_58%)]" />
          )}
        </div>
      </div>
    </div>
  );
}
