"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

type EggMode = "AI" | "ML" | "KABI";

type OverlayState = { mode: EggMode | null; visible: boolean; token: number };

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const BUFFER_LIMIT = 12;
const DISPLAY_MS = {
  AI: 2000,
  ML: 2000,
  KABI: 2600,
} as const;
const COOLDOWN_MS = 5000;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;

  const nearestEditable = target.closest("[contenteditable='true']");
  return Boolean(nearestEditable);
}

function NeuralGraphSVG({ reducedMotion }: { reducedMotion: boolean }) {
  const nodes = [
    { x: 48, y: 118 },
    { x: 96, y: 76 },
    { x: 164, y: 58 },
    { x: 236, y: 84 },
    { x: 292, y: 126 },
    { x: 268, y: 184 },
    { x: 196, y: 206 },
    { x: 126, y: 192 },
    { x: 74, y: 154 },
    { x: 214, y: 144 },
    { x: 158, y: 126 },
  ] as const;

  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 0],
    [1, 10],
    [10, 9],
    [9, 4],
    [10, 6],
  ] as const;

  return (
    <motion.svg
      viewBox="0 0 340 250"
      className="h-full w-full"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: reducedMotion ? 0.45 : 0.92 }}
      transition={{ duration: reducedMotion ? 0.25 : 0.7, ease: EASE }}
    >
      <defs>
        <linearGradient id="ai-link-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(94,234,255,0.86)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0.52)" />
        </linearGradient>
      </defs>

      {links.map((link, idx) => {
        const from = nodes[link[0]];
        const to = nodes[link[1]];
        const d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

        return (
          <motion.path
            key={idx}
            d={d}
            fill="none"
            stroke="url(#ai-link-gradient)"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeDasharray="8 9"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              reducedMotion
                ? { pathLength: 1, opacity: 0.45 }
                : { pathLength: 1, opacity: [0.38, 0.88, 0.38], strokeDashoffset: [0, -48] }
            }
            transition={{
              duration: reducedMotion ? 0.35 : 1.2,
              ease: reducedMotion ? EASE : "linear",
              delay: idx * 0.03,
              repeat: reducedMotion ? 0 : Infinity,
              repeatType: "loop",
            }}
          />
        );
      })}

      {nodes.map((node, idx) => (
        <motion.circle
          key={idx}
          cx={node.x}
          cy={node.y}
          r="3"
          fill="rgba(194,248,255,0.94)"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={reducedMotion ? { opacity: 0.72, scale: 1 } : { opacity: [0.45, 1, 0.45], scale: [0.92, 1.34, 0.92] }}
          transition={{ duration: reducedMotion ? 0.35 : 2.4, ease: EASE, delay: idx * 0.05, repeat: reducedMotion ? 0 : Infinity }}
        />
      ))}

      {!reducedMotion && (
        <>
          <motion.circle
            r="2.5"
            fill="rgba(255,255,255,0.95)"
            filter="drop-shadow(0 0 6px rgba(94,234,255,0.85))"
            animate={{ cx: [48, 96, 164, 236, 292], cy: [118, 76, 58, 84, 126] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r="2.2"
            fill="rgba(167,139,250,0.95)"
            filter="drop-shadow(0 0 6px rgba(167,139,250,0.9))"
            animate={{ cx: [292, 268, 196, 126, 74, 48], cy: [126, 184, 206, 192, 154, 118] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "linear", delay: 0.3 }}
          />
          <motion.circle
            r="2.2"
            fill="rgba(125,211,252,0.98)"
            filter="drop-shadow(0 0 6px rgba(125,211,252,0.9))"
            animate={{ cx: [96, 158, 214, 196], cy: [76, 126, 144, 206] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
          />
        </>
      )}
    </motion.svg>
  );
}

function TrainingLoopSVG({ reducedMotion }: { reducedMotion: boolean }) {
  const curvePoints = [
    { x: 50, y: 170 },
    { x: 92, y: 160 },
    { x: 136, y: 144 },
    { x: 178, y: 130 },
    { x: 226, y: 111 },
    { x: 272, y: 99 },
    { x: 322, y: 86 },
  ] as const;

  return (
    <motion.svg
      viewBox="0 0 360 250"
      className="h-full w-full"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: reducedMotion ? 0.46 : 0.9 }}
      transition={{ duration: reducedMotion ? 0.25 : 0.72, ease: EASE }}
    >
      <defs>
        <linearGradient id="ml-curve-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(167,139,250,0.58)" />
          <stop offset="100%" stopColor="rgba(109,236,255,0.92)" />
        </linearGradient>
      </defs>

      {!reducedMotion && (
        <>
          <motion.circle
            cx="180"
            cy="126"
            r="72"
            fill="none"
            stroke="rgba(94,234,255,0.44)"
            strokeWidth="1.5"
            strokeDasharray="78 34"
            animate={{ rotate: 360 }}
            transition={{ duration: 10.8, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "180px 126px" }}
          />
          <motion.circle
            cx="180"
            cy="126"
            r="92"
            fill="none"
            stroke="rgba(167,139,250,0.35)"
            strokeWidth="1.35"
            strokeDasharray="92 42"
            animate={{ rotate: -360 }}
            transition={{ duration: 14.2, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "180px 126px" }}
          />
        </>
      )}

      <path
        d="M50 170 C86 166 106 158 136 144 C170 128 196 128 226 111 C258 94 288 96 322 86"
        fill="none"
        stroke="rgba(148,163,184,0.34)"
        strokeWidth="1"
        strokeDasharray="3 6"
      />

      <motion.path
        d="M50 170 C86 166 106 158 136 144 C170 128 196 128 226 111 C258 94 288 96 322 86"
        fill="none"
        stroke="url(#ml-curve-gradient)"
        strokeWidth="2.3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={reducedMotion ? { pathLength: 1, opacity: 0.76 } : { pathLength: 1, opacity: [0.5, 1, 0.5] }}
        transition={{ duration: reducedMotion ? 0.45 : 1.55, ease: EASE, repeat: reducedMotion ? 0 : Infinity, repeatDelay: 0.15 }}
      />

      {curvePoints.map((point, idx) => (
        <motion.circle
          key={idx}
          cx={point.x}
          cy={point.y}
          r="2.25"
          fill="rgba(191,246,255,0.9)"
          animate={reducedMotion ? { opacity: 0.7 } : { opacity: [0.34, 1, 0.34], scale: [0.9, 1.26, 0.9] }}
          transition={{ duration: 2.2, repeat: reducedMotion ? 0 : Infinity, ease: EASE, delay: idx * 0.06 }}
        />
      ))}

      {!reducedMotion && (
        <motion.circle
          r="3"
          fill="rgba(255,255,255,0.95)"
          filter="drop-shadow(0 0 8px rgba(94,234,255,0.95))"
          animate={{ cx: curvePoints.map((point) => point.x), cy: curvePoints.map((point) => point.y) }}
          transition={{ duration: 3.7, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.svg>
  );
}

function AIBadge({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-full border border-cyan-200/24 bg-cyan-100/[0.08] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-100"
      animate={reducedMotion ? undefined : { opacity: [0.84, 1, 0.84] }}
      transition={reducedMotion ? undefined : { duration: 2.5, repeat: Infinity, ease: EASE }}
    >
      {!reducedMotion && (
        <motion.span
          className="pointer-events-none absolute inset-y-0 -left-12 w-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          animate={{ x: [0, 90, 200] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      )}
      <span className="relative">AI</span>
    </motion.div>
  );
}

function MLBadge({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative rounded-full border border-cyan-200/22 bg-cyan-100/[0.08] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-100">
      {!reducedMotion && (
        <motion.span
          className="pointer-events-none absolute -inset-[3px] rounded-full border border-violet-200/35"
          animate={{ rotate: 360 }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "linear" }}
        />
      )}
      <span className="relative">ML</span>
    </div>
  );
}

function NeuralChipIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
      <defs>
        <linearGradient id="chip-stroke-overlay" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(115,237,255,0.95)" />
          <stop offset="100%" stopColor="rgba(176,137,255,0.95)" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="32" height="32" rx="10" fill="rgba(7,17,23,0.75)" stroke="url(#chip-stroke-overlay)" strokeWidth="2" />
      <circle cx="24" cy="24" r="2.5" fill="rgba(179,244,255,0.92)" />
      <circle cx="40" cy="24" r="2.5" fill="rgba(179,244,255,0.92)" />
      <circle cx="32" cy="34" r="2.5" fill="rgba(179,244,255,0.92)" />
      <path d="M24 24L32 34L40 24" stroke="rgba(146,234,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MLCoreIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
      <defs>
        <linearGradient id="ml-core-overlay" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(165,180,252,0.9)" />
          <stop offset="100%" stopColor="rgba(94,234,212,0.9)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="8" fill="rgba(20,28,40,0.8)" stroke="url(#ml-core-overlay)" strokeWidth="2" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(130,246,255,0.52)" strokeWidth="1.4" strokeDasharray="2 4" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(167,139,250,0.42)" strokeWidth="1.2" />
      <path d="M14 44C20 35 28 38 34 30C40 23 46 24 50 18" fill="none" stroke="rgba(191,246,255,0.9)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AIOverlay({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 12, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.985, y: 5 }}
      transition={{ duration: reducedMotion ? 0.25 : 0.66, ease: EASE }}
      className="relative w-[min(92vw,38rem)] overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(7,18,24,0.92),rgba(13,16,26,0.9))] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.58),0_0_60px_rgba(71,226,255,0.12)] sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-200/8 via-transparent to-violet-300/8" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-16 -top-12 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-violet-300/10 blur-3xl" />
      </div>

      <div className="relative z-[2] flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <motion.div
            className="relative grid h-14 w-14 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-100/[0.06]"
            animate={reducedMotion ? undefined : { boxShadow: ["0 0 0 rgba(117,231,255,0.2)", "0 0 22px rgba(117,231,255,0.35)", "0 0 0 rgba(117,231,255,0.2)"] }}
            transition={reducedMotion ? undefined : { duration: 3, repeat: Infinity, ease: EASE }}
          >
            <NeuralChipIcon />
          </motion.div>

          <div className="pt-1">
            <p className="text-[1.08rem] font-semibold tracking-wide text-white/95 sm:text-[1.22rem]">Neural Mode Online</p>
            <p className="mt-1 text-sm text-[rgb(var(--muted))] sm:text-[0.94rem]">Synapses linked. Signals flowing.</p>
          </div>
        </div>

        <AIBadge reducedMotion={reducedMotion} />
      </div>

      <div className="relative z-[2] mt-5 h-[140px] sm:h-[150px]">
        <NeuralGraphSVG reducedMotion={reducedMotion} />
      </div>
    </motion.div>
  );
}

function MLOverlay({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: reducedMotion ? 0.25 : 0.68, ease: EASE }}
      className="relative w-[min(92vw,38rem)] overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(10,14,26,0.94),rgba(9,20,25,0.9))] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.58),0_0_60px_rgba(167,139,250,0.12)] sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-200/8 via-transparent to-cyan-300/8" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-16 -top-12 h-56 w-56 rounded-full bg-violet-300/10 blur-3xl" />
        <div className="absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="relative z-[2] flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <motion.div
            className="relative grid h-14 w-14 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-100/[0.06]"
            animate={reducedMotion ? undefined : { boxShadow: ["0 0 0 rgba(117,231,255,0.2)", "0 0 22px rgba(117,231,255,0.35)", "0 0 0 rgba(117,231,255,0.2)"] }}
            transition={reducedMotion ? undefined : { duration: 3, repeat: Infinity, ease: EASE }}
          >
            <MLCoreIcon />
          </motion.div>

          <div className="pt-1">
            <p className="text-[1.08rem] font-semibold tracking-wide text-white/95 sm:text-[1.22rem]">Model Loop Running</p>
            <p className="mt-1 text-sm text-[rgb(var(--muted))] sm:text-[0.94rem]">Train → validate → ship.</p>
          </div>
        </div>

        <MLBadge reducedMotion={reducedMotion} />
      </div>

      <div className="relative z-[2] mt-5 h-[140px] sm:h-[150px]">
        <TrainingLoopSVG reducedMotion={reducedMotion} />
      </div>
    </motion.div>
  );
}

function KabiOverlay({ reducedMotion, onOpenAbout }: { reducedMotion: boolean; onOpenAbout: () => void }) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.97, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: reducedMotion ? 0.25 : 0.7, ease: EASE }}
      className="relative w-[min(92vw,34rem)] overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(7,18,24,0.94),rgba(13,16,26,0.92))] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.58),0_0_50px_rgba(71,226,255,0.08)] sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-200/8 via-transparent to-violet-300/8" />

      <div className="relative z-[2] flex items-start gap-4">
        <motion.div
          className="relative h-16 w-16 overflow-hidden rounded-full border border-cyan-200/25 bg-cyan-100/5"
          animate={reducedMotion ? undefined : { boxShadow: ["0 0 0 rgba(125,211,252,0.2)", "0 0 24px rgba(125,211,252,0.32)", "0 0 0 rgba(125,211,252,0.2)"] }}
          transition={reducedMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: EASE }}
        >
          {imageError ? (
            <div className="grid h-full w-full place-items-center text-lg font-semibold tracking-wide text-cyan-100/90">KR</div>
          ) : (
            <img
              src="/images/profile.jpg"
              alt="Kabiraj Rana"
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-100/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-100/90">
            Shortcut unlocked
          </p>
          <p className="mt-2 text-lg font-semibold text-white/95 sm:text-[1.2rem]">Kabiraj Rana</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">Aspiring AI/ML Engineer • Full-Stack Developer</p>
          <p className="mt-2 text-sm text-white/85">Building practical AI systems with clean engineering.</p>

          <motion.button
            type="button"
            onClick={onOpenAbout}
            whileHover={reducedMotion ? undefined : { y: -1, scale: 1.01 }}
            whileTap={reducedMotion ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-100/[0.1] px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_8px_28px_rgba(56,189,248,0.16)]"
            aria-label="Open About page"
          >
            Open About
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EasterEggOverlay() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [overlay, setOverlay] = useState<OverlayState>({ mode: null, visible: false, token: 0 });
  const [isHydrated, setIsHydrated] = useState(false);

  const reducedMotion = !isHydrated || Boolean(prefersReducedMotion);

  const bufferRef = useRef("");
  const timerRef = useRef<number | null>(null);
  const lastTriggeredRef = useRef<Record<EggMode, number>>({ AI: 0, ML: 0, KABI: 0 });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const closeOverlay = () => {
    setOverlay((current) => ({ ...current, visible: false }));
  };

  const triggerMode = (mode: EggMode) => {
    const now = Date.now();
    if (now - lastTriggeredRef.current[mode] < COOLDOWN_MS) return;
    lastTriggeredRef.current[mode] = now;

    setOverlay({ mode, visible: true, token: now });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOverlay();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target) || isEditableTarget(document.activeElement)) return;

      const key = event.key;
      if (key.length !== 1 || !/[a-z]/i.test(key)) return;

      bufferRef.current = (bufferRef.current + key.toLowerCase()).slice(-BUFFER_LIMIT);

      if (bufferRef.current.endsWith("kabi")) {
        triggerMode("KABI");
        return;
      }
      if (bufferRef.current.endsWith("ai")) {
        triggerMode("AI");
        return;
      }
      if (bufferRef.current.endsWith("ml")) {
        triggerMode("ML");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onTrigger = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: EggMode }>;
      const mode = customEvent.detail?.mode;
      if (!mode) return;
      triggerMode(mode);
    };

    window.addEventListener("kr:easteregg", onTrigger as EventListener);
    return () => window.removeEventListener("kr:easteregg", onTrigger as EventListener);
  }, []);

  const activeMode = overlay.mode;

  const overlayDuration = useMemo(() => {
    if (!activeMode) return DISPLAY_MS.AI;
    return DISPLAY_MS[activeMode];
  }, [activeMode]);

  useEffect(() => {
    if (!overlay.visible || !overlay.mode) return;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      closeOverlay();
      timerRef.current = null;
    }, overlayDuration);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [overlay.visible, overlay.mode, overlayDuration]);

  const onOpenAbout = () => {
    router.push("/about");
    closeOverlay();
  };

  return (
    <AnimatePresence mode="wait">
      {overlay.visible && overlay.mode && (
        <motion.div
          key={`${overlay.mode}-${overlay.token}`}
          className="fixed inset-0 z-[9999] grid place-items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.25 : 0.65, ease: EASE }}
          aria-live="polite"
          aria-label={
            overlay.mode === "AI" ? "Neural mode activated" : overlay.mode === "ML" ? "Model loop activated" : "About shortcut activated"
          }
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.72, ease: EASE }}
          />

          <div className="pointer-events-none relative">
            <div className="pointer-events-auto">
              {overlay.mode === "AI" && <AIOverlay reducedMotion={reducedMotion} />}
              {overlay.mode === "ML" && <MLOverlay reducedMotion={reducedMotion} />}
              {overlay.mode === "KABI" && <KabiOverlay reducedMotion={reducedMotion} onOpenAbout={onOpenAbout} />}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
