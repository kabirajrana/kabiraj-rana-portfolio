"use client";

import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

const INITIAL_MIN_DURATION = 900;
const EXIT_DURATION = 420;
const LOAD_FALLBACK_TIMEOUT = 2800;
const EASE_SMOOTH: [number, number, number, number] = [0.22, 1, 0.36, 1];

const LOADING_STATES = [
  "Initializing Neural Core",
  "Loading Model Weights",
  "Calibrating Feature Extractors",
  "Optimizing Inference Graph",
  "Compiling Experience",
] as const;

const overlayVariants: Variants = {
  enter: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(8px)", transition: { duration: 0.45, ease: EASE_SMOOTH } },
};

const panelVariants: Variants = {
  enter: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.985, transition: { duration: 0.4, ease: EASE_SMOOTH } },
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => {
        mediaQuery.removeEventListener("change", update);
      };
    }

    mediaQuery.addListener(update);
    return () => {
      mediaQuery.removeListener(update);
    };
  }, []);

  return prefersReducedMotion;
}

function InternalNeuralGraph({ reducedMotion }: { reducedMotion: boolean }) {
  const nodes = [
    { id: "n1", x: 24, y: 30, tone: "cyan" },
    { id: "n2", x: 40, y: 44, tone: "blue" },
    { id: "n3", x: 56, y: 34, tone: "cyan" },
    { id: "n4", x: 68, y: 52, tone: "violet" },
    { id: "n5", x: 34, y: 64, tone: "blue" },
    { id: "n6", x: 54, y: 66, tone: "cyan" },
  ] as const;

  const links = [
    ["n1", "n2"],
    ["n2", "n3"],
    ["n2", "n5"],
    ["n3", "n4"],
    ["n5", "n6"],
    ["n3", "n6"],
  ] as const;

  const queueDots = [0, 1, 2, 3];

  const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

  const validNodes = nodes.filter((node) => isFiniteNumber(node.x) && isFiniteNumber(node.y));
  const validNodeMap = new Map(validNodes.map((node) => [node.id, node]));

  type ValidLink = {
    fromId: (typeof links)[number][0];
    toId: (typeof links)[number][1];
    from: (typeof validNodes)[number];
    to: (typeof validNodes)[number];
  };

  const validLinks = links
    .map<ValidLink | null>(([fromId, toId]) => {
      const from = validNodeMap.get(fromId);
      const to = validNodeMap.get(toId);
      if (!from || !to) {
        return null;
      }
      return { fromId, toId, from, to };
    })
    .filter((entry): entry is ValidLink => entry !== null);

  const particlePath = {
    cx: [24, 40, 56, 68, 56, 40, 24],
    cy: [30, 44, 34, 52, 66, 64, 30],
  } as const;

  const hasValidParticlePath =
    particlePath.cx.length > 0 &&
    particlePath.cx.length === particlePath.cy.length &&
    particlePath.cx.every(isFiniteNumber) &&
    particlePath.cy.every(isFiniteNumber);

  return (
    <div className="pointer-events-none absolute inset-[40px]">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        {validLinks.map(({ fromId, toId, from, to }, index) => {
          return (
            <motion.line
              key={`${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="hsl(var(--accent) / 0.34)"
              strokeWidth="0.42"
              strokeLinecap="round"
              animate={{ opacity: reducedMotion ? 0.42 : [0.28, 0.58, 0.28] }}
              transition={{
                duration: reducedMotion ? 0.001 : 2.9,
                delay: reducedMotion ? 0 : index * 0.11,
                repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {validNodes.map((node, index) => {
          const fill = node.tone === "violet" ? "hsl(var(--accent-2) / 0.82)" : node.tone === "blue" ? "hsl(205 92% 72% / 0.84)" : "hsl(var(--accent) / 0.9)";

          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="1.45"
                fill={fill}
                animate={{ opacity: reducedMotion ? 0.78 : [0.52, 1, 0.52] }}
                transition={{
                  duration: reducedMotion ? 0.001 : 2.4,
                  delay: reducedMotion ? 0 : index * 0.14,
                  repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="2.1"
                initial={{ cx: node.x, cy: node.y, r: 2.1, opacity: reducedMotion ? 0.24 : 0.32 }}
                fill="none"
                stroke={fill}
                strokeWidth="0.28"
                animate={{
                  r: reducedMotion ? 2.1 : [2.1, 3.2, 2.1],
                  opacity: reducedMotion ? 0.24 : [0.32, 0.1, 0.32],
                }}
                transition={{
                  duration: reducedMotion ? 0.001 : 3,
                  delay: reducedMotion ? 0 : index * 0.12,
                  repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}

        {hasValidParticlePath ? (
          <motion.circle
            cx={particlePath.cx[0]}
            cy={particlePath.cy[0]}
            r={1.05}
            initial={{ cx: particlePath.cx[0], cy: particlePath.cy[0], r: 1.05, opacity: 0 }}
            fill="hsl(var(--accent) / 0.96)"
            animate={{
              cx: particlePath.cx,
              cy: particlePath.cy,
              opacity: reducedMotion ? 0 : [0, 1, 1, 0.55, 0],
            }}
            transition={{
              duration: reducedMotion ? 0.001 : 3.3,
              repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.65))" }}
          />
        ) : null}
      </svg>

      <div className="absolute right-[8%] top-[12%] flex items-center gap-1.5">
        {queueDots.map((dot, index) => (
          <motion.span
            key={`queue-dot-${dot}`}
            className="h-1 w-1 rounded-full bg-cyan-200"
            animate={{ opacity: reducedMotion ? 0.36 : [0.28, 1, 0.28], scale: reducedMotion ? 1 : [1, 1.4, 1] }}
            transition={{
              duration: reducedMotion ? 0.001 : 1.6,
              delay: reducedMotion ? 0 : index * 0.16,
              repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ boxShadow: "0 0 8px rgba(34,211,238,0.35)" }}
          />
        ))}
      </div>
    </div>
  );
}

function CoreRing({ progress, isExiting, reducedMotion }: { progress: number; isExiting: boolean; reducedMotion: boolean }) {
  const finalSpin = isExiting && !reducedMotion;

  return (
    <div className="relative mx-auto h-40 w-40 sm:h-44 sm:w-44">
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan-300/25"
        animate={{ rotate: finalSpin ? 460 : 360 }}
        transition={{ duration: finalSpin ? 0.85 : 9.5, repeat: finalSpin ? 0 : Number.POSITIVE_INFINITY, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg, hsl(var(--accent) / 0) 0deg, hsl(var(--accent) / 0.42) 65deg, hsl(var(--accent-2) / 0.34) 145deg, hsl(var(--accent) / 0) 280deg, hsl(var(--accent) / 0.26) 360deg)",
          maskImage: "radial-gradient(circle, transparent 62%, black 64%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 62%, black 64%)",
        }}
      />

      <motion.div
        className="absolute inset-[10px] rounded-full border border-sky-300/30"
        animate={{ rotate: finalSpin ? -360 : -260 }}
        transition={{ duration: finalSpin ? 0.85 : 8.8, repeat: finalSpin ? 0 : Number.POSITIVE_INFINITY, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 140deg, hsl(var(--accent-2) / 0.32) 0deg, hsl(var(--accent) / 0.05) 120deg, hsl(var(--accent) / 0.48) 200deg, hsl(var(--accent) / 0) 360deg)",
          maskImage: "radial-gradient(circle, transparent 58%, black 60%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 58%, black 60%)",
        }}
      />

      <motion.div
        className="absolute inset-[19px] rounded-full border border-white/10 bg-[radial-gradient(circle,hsl(var(--accent)/0.16)_0%,transparent_68%)]"
        animate={{ scale: reducedMotion ? 1 : [1, 1.02, 1], opacity: reducedMotion ? 1 : [0.82, 1, 0.82] }}
        transition={{ duration: reducedMotion ? 0.001 : 2.6, repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="absolute inset-[36px] rounded-full border border-border/70 bg-background/80 backdrop-blur">
        <div className="flex h-full items-center justify-center text-[1.7rem] font-semibold tracking-[0.18em] text-cyan-200 drop-shadow-[0_0_10px_rgba(103,232,249,0.35)]">
          K
        </div>
      </div>

      <InternalNeuralGraph reducedMotion={Boolean(reducedMotion)} />

      <motion.div
        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.9)]"
        style={{ transformOrigin: "0 0" }}
        animate={{ rotate: 360, x: 68, y: -2, opacity: reducedMotion ? 0 : 1 }}
        transition={{ duration: reducedMotion ? 0.001 : 3.8, repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-indigo-300 shadow-[0_0_9px_rgba(165,180,252,0.95)]"
        style={{ transformOrigin: "0 0" }}
        animate={{ rotate: -360, x: -58, y: 5, opacity: reducedMotion ? 0 : 1 }}
        transition={{ duration: reducedMotion ? 0.001 : 4.9, repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <div className="absolute -bottom-8 left-1/2 h-0.5 w-28 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
          animate={{ x: ["-140%", "140%"] }}
          transition={{ duration: reducedMotion ? 0.001 : 1.6, repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      {isExiting && !reducedMotion ? (
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-300/30"
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.45, opacity: 0 }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : null}

      <div className="absolute -bottom-[58px] left-1/2 h-1 w-44 -translate-x-1/2 overflow-hidden rounded-full border border-border/70 bg-background/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function PreloaderOverlay({
  progress,
  stateLabel,
  isExiting,
  reducedMotion,
}: {
  progress: number;
  stateLabel: string;
  isExiting: boolean;
  reducedMotion: boolean;
}) {
  const displayProgress = Math.round(progress);

  return (
    <motion.div
      variants={overlayVariants}
      initial="enter"
      animate="enter"
      exit="exit"
      className="fixed inset-0 z-[220] overflow-hidden bg-[radial-gradient(circle_at_20%_18%,hsl(var(--accent)/0.16),transparent_35%),radial-gradient(circle_at_82%_14%,hsl(var(--accent-2)/0.14),transparent_38%),linear-gradient(145deg,hsl(var(--background))_0%,hsl(var(--surface))_52%,hsl(var(--background))_100%)]"
      aria-live="polite"
      aria-label="Portfolio loading"
      role="status"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:34px_34px] opacity-22" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,hsl(var(--background)/0.85)_100%)]" />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-200/10 via-cyan-200/5 to-transparent"
        animate={{ y: ["-25%", "105%"], opacity: reducedMotion ? 0 : [0, 0.18, 0] }}
        transition={{ duration: reducedMotion ? 0.001 : 2.9, repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <div className="relative flex h-full items-center justify-center px-6">
        <motion.div
          variants={panelVariants}
          initial="enter"
          animate="enter"
          exit="exit"
          className="relative w-full max-w-lg rounded-3xl border border-border/70 bg-surface/55 p-7 text-center shadow-[0_30px_80px_-44px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />

          <CoreRing progress={progress} isExiting={isExiting} reducedMotion={Boolean(reducedMotion)} />

          <div className="mt-20 space-y-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-200/90">System Boot</p>
            <h2 className="text-[1.03rem] font-medium tracking-[0.01em] text-text sm:text-[1.08rem]">{stateLabel}</h2>
            <p className="text-sm text-muted">{displayProgress}%</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(4);

  const rafRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const loadFallbackTimeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);

  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    startedAtRef.current = performance.now();
    let hasFinished = false;

    const progressLoop = () => {
      setProgress((prev) => {
        const cap = reducedMotion ? 96 : 93;
        const next = prev + (cap - prev) * 0.07;
        return Math.min(cap, next);
      });
      rafRef.current = window.requestAnimationFrame(progressLoop);
    };

    rafRef.current = window.requestAnimationFrame(progressLoop);

    const finish = () => {
      if (hasFinished) {
        return;
      }

      hasFinished = true;

      const elapsed = performance.now() - startedAtRef.current;
      const wait = Math.max(0, INITIAL_MIN_DURATION - elapsed);

      completeTimeoutRef.current = window.setTimeout(() => {
        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        setProgress(100);
        setIsExiting(true);

        hideTimeoutRef.current = window.setTimeout(() => {
          setIsVisible(false);
          setIsExiting(false);
        }, EXIT_DURATION);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      loadFallbackTimeoutRef.current = window.setTimeout(finish, LOAD_FALLBACK_TIMEOUT);
    }

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (completeTimeoutRef.current !== null) {
        window.clearTimeout(completeTimeoutRef.current);
      }
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      if (loadFallbackTimeoutRef.current !== null) {
        window.clearTimeout(loadFallbackTimeoutRef.current);
      }
      window.removeEventListener("load", finish);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  const stepSize = 100 / LOADING_STATES.length;
  const stateLabel = useMemo(() => {
    const stateIndex = Math.min(LOADING_STATES.length - 1, Math.floor(progress / stepSize));
    return LOADING_STATES[stateIndex];
  }, [progress, stepSize]);

  return (
    <MotionConfig reducedMotion="never">
      <AnimatePresence mode="wait">{isVisible ? <PreloaderOverlay key="global-preloader" progress={progress} stateLabel={stateLabel} isExiting={isExiting} reducedMotion={reducedMotion} /> : null}</AnimatePresence>
      {children}
    </MotionConfig>
  );
}
