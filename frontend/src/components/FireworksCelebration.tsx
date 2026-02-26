"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type FireworksCelebrationProps = {
  sessionId: number | null;
  onFinished: () => void;
};

type Rocket = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
};

type Particle = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  trail: boolean;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const FIREWORKS_CONFIG = {
  durationMs: 4400,
  burstsDesktop: 18,
  burstsMobile: 12,
  particlesPerBurst: [105, 165] as [number, number],
  cooldownMs: 3500,
  trailAlpha: 0.07,
} as const;

const COLORS = [
  "rgba(96, 231, 255, 1)",
  "rgba(128, 238, 255, 1)",
  "rgba(255, 212, 132, 1)",
  "rgba(247, 163, 181, 1)",
  "rgba(188, 156, 255, 1)",
  "rgba(255, 236, 174, 1)",
  "rgba(255, 171, 124, 1)",
  "rgba(255, 145, 176, 1)",
  "rgba(146, 196, 255, 1)",
  "rgba(176, 255, 220, 1)",
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createExplosion(x: number, y: number, color: string, isMobile: boolean) {
  const [minCount, maxCount] = FIREWORKS_CONFIG.particlesPerBurst;
  const count = Math.floor(randomBetween(minCount, maxCount));

  const sparks = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = isMobile ? randomBetween(1.55, 3.85) : randomBetween(2.35, 5.6);

    return {
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: randomBetween(1300, 2200),
      size: randomBetween(1.5, 4.6),
      color: Math.random() < 0.62 ? color : COLORS[Math.floor(Math.random() * COLORS.length)],
      trail: Math.random() < 0.44,
    } satisfies Particle;
  });

  const ringCount = isMobile ? 24 : 40;
  const ring = Array.from({ length: ringCount }, (_, index) => {
    const angle = (index / ringCount) * Math.PI * 2;
    const speed = isMobile ? randomBetween(3.0, 4.2) : randomBetween(3.8, 5.4);
    return {
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: randomBetween(850, 1350),
      size: randomBetween(1.1, 2.4),
      color,
      trail: true,
    } satisfies Particle;
  });

  const glitterCount = isMobile ? 26 : 52;
  const glitter = Array.from({ length: glitterCount }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = isMobile ? randomBetween(1.2, 2.6) : randomBetween(1.6, 3.4);
    return {
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: randomBetween(550, 1100),
      size: randomBetween(0.9, 1.9),
      color: "rgba(255,255,255,0.95)",
      trail: false,
    } satisfies Particle;
  });

  return [...sparks, ...ring, ...glitter];
}

export default function FireworksCelebration({ sessionId, onFinished }: FireworksCelebrationProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const launchScheduleRef = useRef<number[]>([]);
  const scheduleIndexRef = useRef(0);

  const reducedMotion = Boolean(prefersReducedMotion);
  const activeDuration = reducedMotion ? 2400 : FIREWORKS_CONFIG.durationMs;

  const runtimeKey = useMemo(() => sessionId ?? -1, [sessionId]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    setIsVisible(true);
  }, [sessionId]);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = window.setTimeout(() => {
      setIsVisible(false);
    }, activeDuration);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previous;
    };
  }, [activeDuration, isVisible]);

  useEffect(() => {
    if (!isVisible || !sessionId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches;
    const burstCount = isMobile ? FIREWORKS_CONFIG.burstsMobile : FIREWORKS_CONFIG.burstsDesktop;
    const maxConcurrentRockets = isMobile ? 4 : 6;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const buildSchedule = () => {
      const intro = 180;
      const activeWindow = FIREWORKS_CONFIG.durationMs * 0.78;
      launchScheduleRef.current = Array.from(
        { length: burstCount },
        (_, index) => intro + (activeWindow / burstCount) * index + Math.random() * 24
      );
      scheduleIndexRef.current = 0;
    };

    const spawnRocket = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const x = randomBetween(width * 0.2, width * 0.8);
      const y = height + randomBetween(12, 54);
      const targetY = randomBetween(height * 0.18, height * 0.42);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      rocketsRef.current.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: randomBetween(-0.82, 0.82),
        vy: randomBetween(-11.2, -8.4),
        targetY,
        color,
      });
    };

    resize();
    buildSchedule();
    rocketsRef.current = [];
    particlesRef.current = [];
    const openingVolley = isMobile ? 2 : 2;
    for (let index = 0; index < openingVolley; index += 1) {
      spawnRocket();
    }
    startTimeRef.current = performance.now();
    lastFrameRef.current = startTimeRef.current;

    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const deltaMs = Math.min(33, Math.max(10, now - lastFrameRef.current));
      const delta = deltaMs / 16.667;
      lastFrameRef.current = now;
      const width = window.innerWidth;
      const height = window.innerHeight;

      context.fillStyle = `rgba(6, 10, 15, ${FIREWORKS_CONFIG.trailAlpha})`;
      context.fillRect(0, 0, width, height);

      while (
        scheduleIndexRef.current < launchScheduleRef.current.length &&
        elapsed >= launchScheduleRef.current[scheduleIndexRef.current] &&
        rocketsRef.current.length < maxConcurrentRockets
      ) {
        spawnRocket();
        scheduleIndexRef.current += 1;
      }

      rocketsRef.current = rocketsRef.current.filter((rocket) => {
        rocket.prevX = rocket.x;
        rocket.prevY = rocket.y;

        rocket.vx *= 1 - 0.004 * delta;
        rocket.vy += 0.026 * delta;
        rocket.x += rocket.vx * delta;
        rocket.y += rocket.vy * delta;

        context.save();
        context.globalCompositeOperation = "lighter";
        context.strokeStyle = rocket.color;
        context.globalAlpha = 0.95;
        context.lineWidth = 1.8;
        context.shadowColor = rocket.color;
        context.shadowBlur = 16;
        context.beginPath();
        context.moveTo(rocket.prevX, rocket.prevY);
        context.lineTo(rocket.x, rocket.y);
        context.stroke();

        context.strokeStyle = "rgba(255,255,255,0.85)";
        context.globalAlpha = 0.8;
        context.lineWidth = 1.1;
        context.shadowBlur = 10;
        context.beginPath();
        context.moveTo(rocket.prevX, rocket.prevY);
        context.lineTo(rocket.x, rocket.y);
        context.stroke();
        context.restore();

        const explode = rocket.y <= rocket.targetY || rocket.vy >= -0.28;
        if (explode) {
          particlesRef.current.push(...createExplosion(rocket.x, rocket.y, rocket.color, isMobile));
        }

        return !explode;
      });

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.prevX = particle.x;
        particle.prevY = particle.y;
        particle.life += deltaMs;
        const t = Math.min(1, particle.life / particle.maxLife);
        const alpha = Math.max(0, 1 - t * 1.08);

        particle.vx *= 1 - 0.013 * delta;
        particle.vy = particle.vy * (1 - 0.009 * delta) + 0.029 * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        context.save();
        context.globalCompositeOperation = "lighter";
        context.fillStyle = particle.color;
        context.globalAlpha = alpha;
        context.shadowColor = particle.color;
        context.shadowBlur = particle.trail ? 16 : 12;

        if (particle.trail) {
          context.strokeStyle = particle.color;
          context.lineWidth = Math.max(0.8, particle.size * 0.62);
          context.beginPath();
          context.moveTo(particle.prevX, particle.prevY);
          context.lineTo(particle.x, particle.y);
          context.stroke();
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "rgba(255,255,255,0.9)";
        context.globalAlpha = alpha * 0.45;
        context.shadowBlur = 8;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 0.42, 0, Math.PI * 2);
        context.fill();
        context.restore();

        return particle.life < particle.maxLife;
      });

      if (elapsed < activeDuration + 1200) {
        rafRef.current = window.requestAnimationFrame(loop);
      }
    };

    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      rocketsRef.current = [];
      particlesRef.current = [];
    };
  }, [activeDuration, isVisible, reducedMotion, runtimeKey, sessionId]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (sessionId) onFinished();
      }}
    >
      {isVisible && sessionId && (
        <motion.div
          key={runtimeKey}
          className="fixed inset-0 z-[9999] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(3px)" }}
          transition={{ duration: reducedMotion ? 0.25 : 0.8, ease: EASE }}
          aria-live="polite"
          aria-label="Celebration fireworks overlay"
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.25 : 0.9, ease: EASE }}
          />

          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

          {!reducedMotion && (
            <>
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[10vmin] top-[8vmin] h-[42vmin] w-[42vmin] rounded-full bg-[radial-gradient(circle,rgba(255,173,118,0.25),rgba(255,173,118,0.04)_52%,transparent_74%)] mix-blend-screen"
                animate={{ opacity: [0.22, 0.44, 0.22], x: [0, 22, 0], y: [0, 10, 0], scale: [0.95, 1.04, 0.95] }}
                transition={{ duration: 3.4, ease: EASE, repeat: Infinity }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -right-[12vmin] bottom-[6vmin] h-[46vmin] w-[46vmin] rounded-full bg-[radial-gradient(circle,rgba(222,164,255,0.22),rgba(222,164,255,0.04)_52%,transparent_74%)] mix-blend-screen"
                animate={{ opacity: [0.2, 0.4, 0.2], x: [0, -16, 0], y: [0, -8, 0], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 3.6, ease: EASE, repeat: Infinity, delay: 0.24 }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(95,224,255,0.25),rgba(95,224,255,0.06)_45%,transparent_72%)]"
                animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.2, ease: EASE, repeat: Infinity }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(252,205,132,0.15),rgba(212,159,255,0.06)_45%,transparent_72%)]"
                animate={{ opacity: [0.24, 0.42, 0.24], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.2, ease: EASE, repeat: Infinity, delay: 0.18 }}
              />
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.985, filter: "blur(8px)" }}
            transition={{ duration: reducedMotion ? 0.3 : 0.85, ease: EASE }}
            className="relative overflow-hidden rounded-3xl border border-white/12 bg-black/26 px-7 py-6 text-center shadow-[0_24px_74px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-10 sm:py-8"
          >
            <div className="relative z-[1]">
              <motion.p
                initial={{ opacity: 0, y: 8, letterSpacing: "0.06em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.02em" }}
                transition={{ duration: reducedMotion ? 0.28 : 0.74, ease: EASE, delay: 0.08 }}
                className="bg-gradient-to-r from-cyan-100/95 via-white/95 to-violet-100/90 bg-clip-text text-[1.35rem] font-semibold text-transparent sm:text-[1.6rem]"
              >
                Have a good time ✨
              </motion.p>
              {!reducedMotion && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-0 h-full w-16 -translate-x-[170%] bg-gradient-to-r from-transparent via-white/35 to-transparent blur-[1px]"
                  animate={{ x: [0, 240] }}
                  transition={{ duration: 1.8, ease: "linear", repeat: Infinity, repeatDelay: 0.55 }}
                />
              )}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.24 : 0.62, ease: EASE, delay: 0.2 }}
                className="mt-2 text-sm text-cyan-100/85 sm:text-[0.96rem]"
              >
                A little celebration from Kabiraj.
              </motion.p>
              <p className="mt-4 text-xs tracking-[0.2em] text-white/45">KR</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
