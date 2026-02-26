"use client";

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { useRouteLoader } from "@/hooks/useRouteLoader";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const orbitalParticles = [
  { radius: 82, duration: 6.8, delay: 0.08 },
  { radius: 96, duration: 8.2, delay: 0.2 },
  { radius: 112, duration: 9.6, delay: 0.35 },
  { radius: 124, duration: 10.8, delay: 0.48 },
  { radius: 92, duration: 7.4, delay: 0.14 },
  { radius: 106, duration: 9.2, delay: 0.3 },
];

export default function Preloader() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const reducedMotion = !isHydrated || prefersReducedMotion;

  // Route-aware loading state:
  // - Initial load min 900ms
  // - Route transition min 450ms
  const { isLoading, progress, step } = useRouteLoader({
    initialMinMs: 3400,
    transitionMinMs: 1800,
  });

  const circumference = useMemo(() => 2 * Math.PI * 116, []);
  const dashOffset = useMemo(() => circumference * (1 - progress / 100), [circumference, progress]);

  // Lock page scroll while loader is visible.
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (isLoading) document.body.style.overflow = "hidden";
    else document.body.style.overflow = previous;

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.012, filter: "blur(4px)" }}
          transition={{ duration: reducedMotion ? 0.4 : 1.35, ease }}
          className="fixed inset-0 z-[130] overflow-hidden"
          aria-label="AI model boot preloader"
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-[#070A0D]" />

          <motion.div
            aria-hidden="true"
            animate={
              reducedMotion
                ? { opacity: 0.5 }
                : {
                    backgroundPosition: ["0% 45%", "100% 55%", "0% 45%"],
                    opacity: [0.48, 0.58, 0.48],
                  }
            }
            transition={reducedMotion ? undefined : { duration: 14, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 [background:radial-gradient(circle_at_20%_20%,rgba(56,234,255,0.1),transparent_48%),radial-gradient(circle_at_82%_62%,rgba(167,139,250,0.12),transparent_52%)]"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_105%,rgba(0,0,0,0.72),transparent_58%)]" />
          <div className="absolute inset-0 opacity-[0.045] mix-blend-overlay [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.7)_0.6px,transparent_0.6px)] [background-size:2px_2px]" />

          <div className="relative z-[2] flex h-full w-full items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.45 : 1.6, ease }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8"
            >
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

              <div className="relative mx-auto h-[290px] w-[290px] sm:h-[330px] sm:w-[330px]">
                <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                  <circle cx="150" cy="150" r="116" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                  <motion.circle
                    cx="150"
                    cy="150"
                    r="116"
                    fill="none"
                    stroke="rgba(128,238,255,0.86)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transition={{ duration: reducedMotion ? 0.25 : 1.1, ease }}
                  />
                </svg>

                {!reducedMotion && (
                  <motion.svg
                    viewBox="0 0 300 300"
                    className="absolute inset-0 h-full w-full"
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: [0.34, 0.65, 0.34] }}
                    transition={{ duration: 5.6, repeat: Infinity, ease }}
                    aria-hidden="true"
                  >
                    <motion.g
                      animate={{ x: [0, 3, 0, -2, 0], y: [0, -2, 0, 2, 0], rotate: [0, 1, 0, -1, 0] }}
                      transition={{ duration: 7.8, repeat: Infinity, ease }}
                      style={{ transformOrigin: "150px 150px" }}
                    >
                      <motion.line
                        x1="96"
                        y1="166"
                        x2="132"
                        y2="118"
                        stroke="rgba(150,234,255,0.22)"
                        strokeWidth="1.1"
                        strokeDasharray="10 18"
                        animate={{ strokeDashoffset: [0, -56] }}
                        transition={{ duration: 2.9, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.line
                        x1="132"
                        y1="118"
                        x2="174"
                        y2="150"
                        stroke="rgba(150,234,255,0.22)"
                        strokeWidth="1.1"
                        strokeDasharray="10 16"
                        animate={{ strokeDashoffset: [0, -48] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: 0.25 }}
                      />
                      <motion.line
                        x1="174"
                        y1="150"
                        x2="220"
                        y2="124"
                        stroke="rgba(150,234,255,0.22)"
                        strokeWidth="1.1"
                        strokeDasharray="8 14"
                        animate={{ strokeDashoffset: [0, -44] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 0.4 }}
                      />

                      <motion.circle cx="96" cy="166" r="2.1" fill="rgba(194,248,255,0.78)" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.8, repeat: Infinity, ease }} />
                      <motion.circle cx="132" cy="118" r="2.1" fill="rgba(194,248,255,0.78)" animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.4, repeat: Infinity, ease, delay: 0.2 }} />
                      <motion.circle cx="174" cy="150" r="2.1" fill="rgba(194,248,255,0.78)" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.2, repeat: Infinity, ease, delay: 0.35 }} />
                      <motion.circle cx="220" cy="124" r="2.1" fill="rgba(194,248,255,0.78)" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.6, repeat: Infinity, ease, delay: 0.5 }} />
                    </motion.g>
                  </motion.svg>
                )}

                <motion.div
                  className="absolute inset-[14px] rounded-full border border-cyan-300/20 [background:conic-gradient(from_30deg,rgba(56,234,255,0.62)_0deg,rgba(56,234,255,0.04)_105deg,rgba(167,139,250,0.4)_210deg,rgba(56,234,255,0.04)_300deg,rgba(56,234,255,0.62)_360deg)] [mask:radial-gradient(farthest-side,transparent_calc(100%-10px),#000_calc(100%-10px))]"
                  animate={reducedMotion ? undefined : { rotate: 360 }}
                  transition={reducedMotion ? undefined : { duration: 7.4, repeat: Infinity, ease: "linear" }}
                />

                <motion.div
                  className="absolute inset-[34px] rounded-full border border-violet-300/18 [background:conic-gradient(from_250deg,rgba(167,139,250,0.56)_0deg,rgba(167,139,250,0.02)_120deg,rgba(56,234,255,0.34)_235deg,rgba(167,139,250,0.56)_360deg)] [mask:radial-gradient(farthest-side,transparent_calc(100%-8px),#000_calc(100%-8px))]"
                  animate={reducedMotion ? undefined : { rotate: -360 }}
                  transition={reducedMotion ? undefined : { duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {!reducedMotion && (
                  <motion.div
                    className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent blur-[1px]"
                    animate={{ y: [0, 285, 0] }}
                    transition={{ duration: 6.4, repeat: Infinity, ease }}
                  />
                )}

                <motion.svg
                  viewBox="0 0 300 300"
                  className="absolute inset-0 h-full w-full"
                  initial={{ opacity: 0.4 }}
                  animate={reducedMotion ? { opacity: 0.45 } : { opacity: [0.36, 0.7, 0.36] }}
                  transition={reducedMotion ? undefined : { duration: 4.8, repeat: Infinity, ease }}
                  aria-hidden="true"
                >
                  <line x1="84" y1="166" x2="126" y2="114" stroke="rgba(146,232,255,0.24)" strokeWidth="1.1" />
                  <line x1="126" y1="114" x2="170" y2="152" stroke="rgba(146,232,255,0.24)" strokeWidth="1.1" />
                  <line x1="170" y1="152" x2="220" y2="124" stroke="rgba(146,232,255,0.24)" strokeWidth="1.1" />
                  <circle cx="84" cy="166" r="2.1" fill="rgba(192,248,255,0.7)" />
                  <circle cx="126" cy="114" r="2.1" fill="rgba(192,248,255,0.7)" />
                  <circle cx="170" cy="152" r="2.1" fill="rgba(192,248,255,0.7)" />
                  <circle cx="220" cy="124" r="2.1" fill="rgba(192,248,255,0.7)" />
                </motion.svg>

                {orbitalParticles.map((particle, index) => (
                  <motion.div
                    key={`${particle.radius}-${index}`}
                    className="absolute inset-0"
                    animate={reducedMotion ? undefined : { rotate: 360 }}
                    transition={
                      reducedMotion
                        ? undefined
                        : {
                            duration: particle.duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: particle.delay,
                          }
                    }
                  >
                    <motion.span
                      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-cyan-100/85 shadow-[0_0_16px_rgba(76,226,255,0.55)]"
                      style={{ transform: `translate(-50%, -50%) translateX(${particle.radius}px)` }}
                      animate={reducedMotion ? undefined : { y: [0, -4, 0, 2, 0], opacity: [0.45, 1, 0.45] }}
                      transition={
                        reducedMotion
                          ? undefined
                          : {
                              duration: 2.5 + (index % 4) * 0.35,
                              repeat: Infinity,
                              ease,
                            }
                      }
                    />
                  </motion.div>
                ))}

                <div className="absolute inset-0 grid place-items-center">
                  <motion.div
                    animate={reducedMotion ? { scale: 1 } : { scale: [1, 1.03, 1] }}
                    transition={reducedMotion ? undefined : { duration: 2.6, repeat: Infinity, ease }}
                    className="rounded-full border border-white/10 bg-black/35 px-8 py-6 backdrop-blur-md"
                  >
                    <p className="font-[var(--font-serif)] text-4xl tracking-[0.08em] text-white/92">K</p>
                  </motion.div>
                </div>
              </div>

              <div className="relative -mt-2 text-center">
                {!reducedMotion && (
                  <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0.28, scale: 0.82 }}
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.88, 1.06, 0.88] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease }}
                    className="pointer-events-none absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(120,230,255,0.3),transparent_72%)]"
                  />
                )}

                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.95, ease }}
                  className="text-sm tracking-[0.35em] text-[rgb(var(--muted))]"
                >
                  KR
                </motion.p>
                <p className="mt-2 text-xl font-medium text-[rgb(var(--fg))] md:text-2xl">Kabiraj Rana</p>

                <div className="mt-2 h-5">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={step}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.86, ease }}
                      className="text-xs tracking-[0.14em] text-[rgb(var(--muted))] md:text-sm"
                    >
                      {step}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2.5 text-xs text-[rgb(var(--muted))]">
                  <span>Boot Sequence</span>
                  <span>•</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
