"use client";

import { useEffect, useMemo, useRef } from "react";

import { clamp, lerp, prefersReducedMotion } from "@/lib/utils";

type Vec2 = { x: number; y: number };

export default function Robot2D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const leftPupilRef = useRef<SVGCircleElement | null>(null);
  const rightPupilRef = useRef<SVGCircleElement | null>(null);
  const specRef = useRef<SVGCircleElement | null>(null);

  const stateRef = useRef({
    target: { x: 0, y: 0 } as Vec2,
    current: { x: 0, y: 0 } as Vec2,
    raf: 0,
  });

  const canHover = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduced = prefersReducedMotion();

    const onMove = (e: PointerEvent) => {
      if (!canHover || reduced) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      stateRef.current.target = {
        x: clamp(x * 2 - 1, -1, 1),
        y: clamp(y * 2 - 1, -1, 1),
      };
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    return () => container.removeEventListener("pointermove", onMove);
  }, [canHover]);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const tick = () => {
      const head = headRef.current;
      const leftPupil = leftPupilRef.current;
      const rightPupil = rightPupilRef.current;
      const spec = specRef.current;
      if (!head || !leftPupil || !rightPupil || !spec) return;

      const { target, current } = stateRef.current;
      const follow = reduced ? 0.06 : 0.12;

      current.x = lerp(current.x, target.x, follow);
      current.y = lerp(current.y, target.y, follow);

      const yaw = clamp(current.x * 7, -7, 7);
      const pitch = clamp(current.y * -5, -5, 5);
      head.style.transform = `rotate(${yaw}deg) translateY(${pitch * 0.2}px)`;
      head.style.transformOrigin = "50% 55%";

      const pupilX = clamp(current.x * 2.6, -2.6, 2.6);
      const pupilY = clamp(current.y * 2.2, -2.2, 2.2);
      leftPupil.setAttribute("cx", (86 + pupilX).toFixed(2));
      leftPupil.setAttribute("cy", (103 + pupilY).toFixed(2));
      rightPupil.setAttribute("cx", (170 + pupilX).toFixed(2));
      rightPupil.setAttribute("cy", (103 + pupilY).toFixed(2));

      spec.setAttribute("cx", (120 + current.x * 7).toFixed(2));
      spec.setAttribute("cy", (62 + current.y * 5).toFixed(2));

      stateRef.current.raf = window.requestAnimationFrame(tick);
    };

    stateRef.current.raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
      <svg
        viewBox="0 0 260 320"
        className="h-full w-full"
        role="img"
        aria-label="Interactive robot visual"
      >
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2efe8" stopOpacity="0.18" />
            <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.42" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="30%" r="75%">
            <stop offset="0" stopColor="rgb(var(--accent))" stopOpacity="0.22" />
            <stop offset="1" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        <g ref={headRef} className={canHover ? "" : "robot-idle"}>
          <path
            d="M62 60c6-24 26-42 51-46 12-2 24-2 36 0 25 4 45 22 51 46l10 46c3 13-1 27-10 37l-26 30c-9 10-22 16-36 16h-56c-14 0-27-6-36-16l-26-30c-9-10-13-24-10-37l10-46z"
            fill="url(#metal)"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1.25"
          />
          <path
            d="M78 88h104c9 0 16 7 16 16v10c0 9-7 16-16 16H78c-9 0-16-7-16-16v-10c0-9 7-16 16-16z"
            fill="rgba(0,0,0,0.36)"
            stroke="rgba(255,255,255,0.10)"
          />

          <g className={canHover ? "" : "robot-blink"}>
            <ellipse cx="86" cy="103" rx="20" ry="16" fill="rgba(255,255,255,0.06)" />
            <ellipse cx="170" cy="103" rx="20" ry="16" fill="rgba(255,255,255,0.06)" />
          </g>

          <circle ref={leftPupilRef} cx="86" cy="103" r="6.4" fill="rgb(var(--accent))" />
          <circle ref={rightPupilRef} cx="170" cy="103" r="6.4" fill="rgb(var(--accent))" />
          <circle cx="83" cy="100" r="2" fill="rgba(255,255,255,0.9)" />
          <circle cx="167" cy="100" r="2" fill="rgba(255,255,255,0.9)" />

          <path
            d="M118 142c8 6 16 6 24 0"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M80 70c20-26 80-26 100 0"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M68 130c15 18 29 22 62 22s47-4 62-22"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle cx="130" cy="74" r="58" fill="url(#glow)" filter="url(#soft)" />
          <circle ref={specRef} cx="120" cy="62" r="22" fill="rgba(255,255,255,0.08)" />
        </g>

        <g opacity="0.9">
          <path
            d="M86 198c4-10 14-16 25-16h38c11 0 21 6 25 16l14 36c4 12-4 24-17 24H89c-13 0-21-12-17-24l14-36z"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.10)"
          />
          <path
            d="M104 214h52"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="130" cy="238" r="10" fill="rgba(0,0,0,0.28)" />
          <circle cx="130" cy="238" r="4.6" fill="rgb(var(--accent))" opacity="0.9" />
        </g>
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
      />
    </div>
  );
}
