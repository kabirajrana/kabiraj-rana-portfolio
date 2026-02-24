"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type SurpriseEventDetail = {
  onComplete?: (played: boolean) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  color: string;
  rot: number;
  spin: number;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const SURPRISE_CONFIG = {
  durationMs: 2100,
  exitMs: 650,
  confettiCount: 120,
  cooldownMs: 4000,
} as const;

const COLORS = [
  "#69dff4",
  "#79e3ff",
  "#f4cf83",
  "#ef9dbf",
  "#b99cff",
  "#9fe8d6",
];

function createParticles(width: number, height: number, count: number) {
  const originX = width / 2;
  const originY = height / 2;

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.9 + Math.random() * 2.6;

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (0.6 + Math.random() * 1.1),
      life: 0,
      ttl: 950 + Math.random() * 1100,
      size: 2 + Math.random() * 4.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.18,
    } satisfies Particle;
  });
}

export default function SurpriseCelebration() {
  const prefersReducedMotion = useReducedMotion();

  const [isHydrated, setIsHydrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const lastPlayedRef = useRef(0);
  const completeRef = useRef<((played: boolean) => void) | null>(null);

  const reducedMotion = !isHydrated || Boolean(prefersReducedMotion);

  const activeDuration = useMemo(() => (reducedMotion ? 800 : SURPRISE_CONFIG.durationMs), [reducedMotion]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const onTrigger = (event: Event) => {
      const customEvent = event as CustomEvent<SurpriseEventDetail>;
      const now = Date.now();

      if (now - lastPlayedRef.current < SURPRISE_CONFIG.cooldownMs) {
        customEvent.detail?.onComplete?.(false);
        return;
      }

      lastPlayedRef.current = now;
      completeRef.current = customEvent.detail?.onComplete ?? null;

      setToken(now);
      setVisible(true);
    };

    window.addEventListener("kr:surprise:play", onTrigger as EventListener);
    return () => window.removeEventListener("kr:surprise:play", onTrigger as EventListener);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, activeDuration);

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeDuration, visible]);

  useEffect(() => {
    if (!visible || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches;
    const count = isMobile ? Math.min(80, SURPRISE_CONFIG.confettiCount) : SURPRISE_CONFIG.confettiCount;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = createParticles(width, height, count);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    startRef.current = performance.now();

    const draw = (now: number) => {
      const elapsed = now - startRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      context.clearRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => {
        particle.life += 16;

        const progress = Math.min(1, particle.life / particle.ttl);
        const alpha = Math.max(0, 1 - progress * 1.08);

        particle.vx *= 0.992;
        particle.vy += 0.019;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rot += particle.spin;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rot);
        context.globalAlpha = alpha;
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.7);
        context.restore();
      });

      const done = elapsed > activeDuration + SURPRISE_CONFIG.exitMs;
      if (done) {
        rafRef.current = null;
        return;
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("resize", resizeCanvas);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [activeDuration, reducedMotion, token, visible]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        completeRef.current?.(true);
        completeRef.current = null;
      }}
    >
      {visible && (
        <motion.div
          key={token}
          className="fixed inset-0 z-[9999] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(3px)" }}
          transition={{ duration: reducedMotion ? 0.2 : 0.42, ease: EASE }}
          aria-live="polite"
          aria-label="Celebration overlay"
        >
          <motion.div
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.18 : SURPRISE_CONFIG.exitMs / 1000, ease: EASE }}
          />

          {!reducedMotion && <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />}

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.985, y: 5, filter: "blur(4px)" }}
            transition={{ duration: reducedMotion ? 0.24 : 0.65, ease: EASE }}
            className="relative mx-5 overflow-hidden rounded-3xl border border-white/12 bg-black/55 px-8 py-7 text-center shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-12 sm:py-9"
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(85,223,255,0.26),rgba(217,170,255,0.1)_42%,transparent_70%)]"
              animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0.42, 0.72, 0.42], scale: [0.88, 1.12, 0.88] }}
              transition={{ duration: reducedMotion ? 0.3 : 2.2, ease: EASE, repeat: reducedMotion ? 0 : Infinity }}
            />

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/30"
              animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.08, 0.9] }}
              transition={{ duration: reducedMotion ? 0.3 : 1.8, ease: EASE, repeat: reducedMotion ? 0 : Infinity }}
            />

            <div className="relative z-[1]">
              <p className="text-[1.35rem] font-semibold tracking-[0.03em] text-white/95 sm:text-[1.55rem]">Have a good time ✨</p>
              <p className="mt-2 text-sm text-cyan-100/82 sm:text-[0.95rem]">A little spark for your day.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
