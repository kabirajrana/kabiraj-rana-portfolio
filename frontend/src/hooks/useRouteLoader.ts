"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "framer-motion";

type UseRouteLoaderOptions = {
  initialMinMs?: number;
  transitionMinMs?: number;
};

const BOOT_STEPS = [
  "Initializing Neural Core",
  "Loading Model Weights",
  "Calibrating Feature Extractors",
  "Optimizing Inference Graph",
  "Compiling Experience",
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Smooth progress profile that feels intentional:
// - 0..84% during most of the duration
// - final 16% near the end
function mapProgress(t: number) {
  if (t < 0.55) return (t / 0.55) * 62;
  if (t < 0.88) return 62 + ((t - 0.55) / 0.33) * 28;
  return 90 + ((t - 0.88) / 0.12) * 10;
}

export function useRouteLoader(options?: UseRouteLoaderOptions) {
  const prefersReducedMotion = useReducedMotion();

  const initialMinMs = options?.initialMinMs ?? 900;

  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const minMs = initialMinMs;

    const duration = prefersReducedMotion ? Math.round(minMs * 0.6) : minMs;
    const start = performance.now();

    setIsLoading(true);
    setProgress(0);
    setStepIndex(0);

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = clamp(elapsed / duration, 0, 1);

      const nextProgress = clamp(mapProgress(t), 0, 100);
      setProgress(nextProgress);

      const nextStep = clamp(
        Math.floor((elapsed / duration) * BOOT_STEPS.length),
        0,
        BOOT_STEPS.length - 1
      );
      setStepIndex(nextStep);

      if (t >= 1) {
        setProgress(100);
        setStepIndex(BOOT_STEPS.length - 1);
        setIsLoading(false);
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [initialMinMs, prefersReducedMotion]);

  return {
    isLoading,
    progress,
    step: BOOT_STEPS[stepIndex],
  };
}
