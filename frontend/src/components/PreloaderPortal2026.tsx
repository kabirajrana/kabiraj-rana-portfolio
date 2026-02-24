"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const PORTAL_CONFIG = {
  minDurationMs: 2600,
  maxDurationMs: 4200,
  phaseDelays: [900, 900, 900],
  exitDurationMs: 900,
  reducedMotionMs: 650,
} as const;

type PhaseIndex = 0 | 1 | 2 | 3;

type Particle = {
  ring: number;
  angle: number;
  speed: number;
  radiusJitter: number;
  wobbleSeed: number;
  wobbleAmp: number;
  x: number;
  y: number;
};

type Spark = {
  angle: number;
  ring: number;
  life: number;
  ttl: number;
};

type Pulse = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  t: number;
  speed: number;
  life: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getPhase(progressMs: number): PhaseIndex {
  const [a, b, c] = PORTAL_CONFIG.phaseDelays;
  if (progressMs < a) return 0;
  if (progressMs < a + b) return 1;
  if (progressMs < a + b + c) return 2;
  return 3;
}

function statusForPhase(phase: PhaseIndex) {
  if (phase === 0) return "Warming neural cores…";
  if (phase === 1) return "Linking synapses…";
  if (phase === 2) return "Calibrating inference…";
  return "Ready.";
}

export default function PreloaderPortal2026() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<PhaseIndex>(0);
  const progressRef = useRef(0);

  const [shouldRender, setShouldRender] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<PhaseIndex>(0);
  const [progress, setProgress] = useState(0);

  const portalDuration = useMemo(() => {
    const base = PORTAL_CONFIG.phaseDelays.reduce((sum, value) => sum + value, 0) + 400;
    const randomInRange =
      PORTAL_CONFIG.minDurationMs +
      Math.random() * (PORTAL_CONFIG.maxDurationMs - PORTAL_CONFIG.minDurationMs);
    return clamp(randomInRange, base, PORTAL_CONFIG.maxDurationMs);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShouldRender(true);
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;

    if (reducedMotion) {
      setProgress(1);
      setPhase(3);
      const timer = window.setTimeout(() => {
        setShouldRender(false);
      }, PORTAL_CONFIG.reducedMotionMs);
      return () => window.clearTimeout(timer);
    }

    const startTime = performance.now();
    const totalMs = portalDuration;
    let rafId = 0;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const ratio = clamp(elapsed / totalMs, 0, 1);
      setProgress(ratio);
      setPhase(getPhase(elapsed));

      if (ratio >= 1) {
        setShouldRender(false);
        return;
      }

      rafId = window.requestAnimationFrame(update);
    };

    rafId = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [portalDuration, reducedMotion, shouldRender]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!shouldRender || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const isMobile = mediaQuery.matches;

    const ringRadii = isMobile ? [86, 114, 146] : [112, 152, 196];
    const ringCounts = isMobile ? [42, 52, 58] : [58, 70, 82];
    const maxConnections = isMobile ? 250 : 420;
    const connectionThreshold = isMobile ? 74 : 88;
    const glowScale = isMobile ? 0.72 : 1;

    const particles: Particle[] = [];
    ringCounts.forEach((count, ring) => {
      for (let index = 0; index < count; index += 1) {
        particles.push({
          ring,
          angle: (Math.PI * 2 * index) / count,
          speed: (0.16 + Math.random() * 0.22) * (ring === 2 ? 0.82 : 1),
          radiusJitter: (Math.random() - 0.5) * 8,
          wobbleSeed: Math.random() * Math.PI * 2,
          wobbleAmp: 1.2 + Math.random() * 2.2,
          x: 0,
          y: 0,
        });
      }
    });

    const sparks: Spark[] = [];
    const pulses: Pulse[] = [];

    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    const onMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (event.clientX / innerWidth - 0.5) * 2;
      const ny = (event.clientY / innerHeight - 0.5) * 2;
      mouseTarget.x = nx * 10;
      mouseTarget.y = ny * 7;
    };

    if (!isMobile) {
      window.addEventListener("mousemove", onMouseMove);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTime = performance.now();
    let running = true;
    let sparkCooldown = 0;
    let pulseCooldown = 0;
    let raf = 0;

    const loop = (now: number) => {
      if (!running) return;

      const dtRaw = (now - lastTime) / 1000;
      lastTime = now;
      const dt = clamp(dtRaw, 0, 0.05);

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const cx = width * 0.5;
      const cy = height * 0.42;

      const currentPhase = phaseRef.current;
      const progressValue = progressRef.current;
      const phaseSpeed = currentPhase === 0 ? 0.82 : currentPhase === 1 ? 1 : currentPhase === 2 ? 1.14 : 1;
      const aperture =
        currentPhase < 2
          ? 0.18 + progressValue * 0.15
          : currentPhase === 2
            ? 0.52 + (progressValue - 0.66) * 1.12
            : 0.68;

      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.06;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.06;

      context.clearRect(0, 0, width, height);

      const bgGradient = context.createRadialGradient(cx, cy, 80, cx, cy, Math.max(width, height) * 0.65);
      bgGradient.addColorStop(0, "rgba(26, 62, 77, 0.20)");
      bgGradient.addColorStop(1, "rgba(5, 8, 12, 0)");
      context.fillStyle = bgGradient;
      context.fillRect(0, 0, width, height);

      const ringOffsets = [0, currentPhase >= 2 ? -8 : -2, currentPhase >= 2 ? 10 : 2];

      for (let ring = 0; ring < ringRadii.length; ring += 1) {
        const ringRadius = ringRadii[ring] + ringOffsets[ring];

        context.beginPath();
        context.arc(
          cx + mouseCurrent.x * (0.2 + ring * 0.05),
          cy + mouseCurrent.y * (0.2 + ring * 0.05),
          ringRadius,
          0,
          Math.PI * 2
        );
        context.strokeStyle = `rgba(132, 228, 255, ${0.08 + ring * 0.03})`;
        context.lineWidth = 1.1;
        context.stroke();
      }

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        particle.angle += particle.speed * phaseSpeed * dt;

        const baseRadius = ringRadii[particle.ring] + ringOffsets[particle.ring];
        const wobble = Math.sin(now * 0.0014 + particle.wobbleSeed) * particle.wobbleAmp;
        const radius = baseRadius + particle.radiusJitter + wobble;

        particle.x = cx + Math.cos(particle.angle) * radius + mouseCurrent.x * (0.45 + particle.ring * 0.1);
        particle.y = cy + Math.sin(particle.angle) * radius + mouseCurrent.y * (0.45 + particle.ring * 0.1);
      }

      let connectionCount = 0;
      context.lineWidth = 0.85;

      for (let i = 0; i < particles.length && connectionCount < maxConnections; i += 1) {
        for (let j = i + 1; j < particles.length && connectionCount < maxConnections; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance > connectionThreshold) continue;

          const alpha = (1 - distance / connectionThreshold) * (currentPhase >= 1 ? 0.22 : 0.12);
          context.strokeStyle = `rgba(148, 234, 255, ${alpha})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
          connectionCount += 1;

          if (currentPhase >= 1 && pulses.length < (isMobile ? 10 : 16) && pulseCooldown <= 0 && Math.random() > 0.986) {
            pulses.push({
              ax: a.x,
              ay: a.y,
              bx: b.x,
              by: b.y,
              t: 0,
              speed: 0.6 + Math.random() * 0.8,
              life: 1,
            });
            pulseCooldown = 0.04;
          }
        }
      }

      pulseCooldown -= dt;
      sparkCooldown -= dt;

      for (let index = pulses.length - 1; index >= 0; index -= 1) {
        const pulse = pulses[index];
        pulse.t += pulse.speed * dt;
        pulse.life -= dt * 0.24;

        if (pulse.t >= 1 || pulse.life <= 0) {
          pulses.splice(index, 1);
          continue;
        }

        const px = pulse.ax + (pulse.bx - pulse.ax) * pulse.t;
        const py = pulse.ay + (pulse.by - pulse.ay) * pulse.t;

        context.beginPath();
        context.arc(px, py, 1.8, 0, Math.PI * 2);
        context.fillStyle = "rgba(183, 245, 255, 0.95)";
        context.fill();
      }

      if (sparkCooldown <= 0 && sparks.length < (isMobile ? 12 : 20) && Math.random() > 0.955) {
        sparks.push({
          angle: Math.random() * Math.PI * 2,
          ring: Math.floor(Math.random() * ringRadii.length),
          life: 1,
          ttl: 0.35 + Math.random() * 0.5,
        });
        sparkCooldown = 0.06;
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        spark.ttl -= dt;
        if (spark.ttl <= 0) {
          sparks.splice(index, 1);
          continue;
        }

        spark.life = spark.ttl / 0.85;
        const radius = ringRadii[spark.ring] + ringOffsets[spark.ring] + Math.sin(now * 0.0017 + spark.angle) * 4;
        const x = cx + Math.cos(spark.angle) * radius;
        const y = cy + Math.sin(spark.angle) * radius;

        context.beginPath();
        context.arc(x, y, 2.1, 0, Math.PI * 2);
        context.fillStyle = `rgba(190, 248, 255, ${spark.life * 0.85})`;
        context.fill();
      }

      context.save();
      context.globalCompositeOperation = "lighter";
      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const nodeAlpha = currentPhase === 0 ? 0.36 : currentPhase === 1 ? 0.52 : 0.66;

        context.beginPath();
        context.arc(particle.x, particle.y, 1.45, 0, Math.PI * 2);
        context.fillStyle = `rgba(205, 247, 255, ${nodeAlpha})`;
        context.fill();

        context.beginPath();
        context.arc(particle.x, particle.y, 4.2 * glowScale, 0, Math.PI * 2);
        context.fillStyle = `rgba(102, 222, 255, ${0.06 + nodeAlpha * 0.12})`;
        context.fill();
      }
      context.restore();

      const completionRadius = ringRadii[2] + 22;
      context.beginPath();
      context.arc(cx, cy, completionRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressValue);
      context.strokeStyle = "rgba(173, 242, 255, 0.75)";
      context.lineWidth = 2;
      context.stroke();

      const apertureGradient = context.createRadialGradient(cx, cy, 0, cx, cy, 90 + aperture * 100);
      apertureGradient.addColorStop(0, `rgba(120,230,255,${0.14 + aperture * 0.2})`);
      apertureGradient.addColorStop(1, "rgba(120,230,255,0)");
      context.beginPath();
      context.arc(cx, cy, 92 + aperture * 65, 0, Math.PI * 2);
      context.fillStyle = apertureGradient;
      context.fill();

      if (currentPhase >= 2) {
        const sweep = ((now * 0.0012) % (Math.PI * 2)) - Math.PI / 2;
        context.beginPath();
        context.arc(cx, cy, ringRadii[2] + 8, sweep, sweep + 0.24);
        context.strokeStyle = "rgba(208, 248, 255, 0.72)";
        context.lineWidth = 2.2;
        context.stroke();
      }

      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (!isMobile) {
        window.removeEventListener("mousemove", onMouseMove);
      }
    };
  }, [reducedMotion, shouldRender]);

  if (shouldRender === null) return null;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
          transition={{ duration: PORTAL_CONFIG.exitDurationMs / 1000, ease: EASE }}
          className="fixed inset-0 z-[140] pointer-events-auto"
          aria-label="Neural Portal Loader"
        >
          <div className="absolute inset-0 bg-[#070A0D]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(98,213,255,0.09),transparent_58%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:30px_30px]" />

          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          <div className="relative z-[2] flex h-full w-full flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.35 : 0.95, ease: EASE }}
              className="text-center"
            >
              <p className="text-xs tracking-[0.4em] text-white/65">KR</p>
              <h2 className="mt-2 font-[var(--font-serif)] text-2xl text-white/95 md:text-3xl">Kabiraj Rana</h2>

              <div className="mt-3 h-5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="text-xs tracking-[0.16em] text-white/60 md:text-sm"
                  >
                    {statusForPhase(phase)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
