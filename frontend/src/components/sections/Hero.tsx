"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import SplineRobot from "@/components/three/SplineRobot";
import { cn } from "@/lib/utils";

export default function Hero() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section
      id="home"
      className="relative scroll-mt-28 pt-[calc(var(--nav-h,80px)+1.5rem)] md:pt-[calc(var(--nav-h,80px)-1.75rem)] lg:pt-[calc(var(--nav-h,80px)-2rem)]"
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12 xl:gap-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-xs tracking-[0.35em] text-[rgb(var(--muted))]"
          >
            HELLO, I’M
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              "mt-4 font-[var(--font-serif)] text-5xl sm:text-6xl md:text-7xl",
              "leading-[0.92] tracking-tight"
            )}
          >
            Kabiraj Rana
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-5 text-sm font-medium tracking-wide text-[rgb(var(--fg))] md:text-base"
          >
            <span className="text-[rgb(var(--accent))]">AI/ML Student</span> • Full‑Stack Developer • Data Science Enthusiast
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-6 max-w-xl text-base leading-relaxed text-[rgb(var(--muted))]"
          >
            BSc (Hons) Computing with AI at Softwarica College (Coventry University). I
            build intelligent digital products where modern web engineering meets applied
            machine learning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/projects"
              className={cn(
                "group inline-flex w-full items-center justify-center gap-2 rounded-full sm:w-auto",
                "bg-[rgb(var(--accent))] px-5 py-3 text-sm font-medium text-black",
                "transition-transform hover:-translate-y-0.5"
              )}
            >
              Explore Work
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <Link
              href="/contact"
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-full border sm:w-auto",
                "border-white/15 bg-white/5 px-5 py-3 text-sm font-medium",
                "text-[rgb(var(--fg))] backdrop-blur-md transition-colors hover:bg-white/10"
              )}
            >
              Get in Touch
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-10 flex items-center gap-4"
          >
            <div className="h-px w-10 bg-white/10" />
            <p className="text-xs tracking-[0.22em] text-[rgb(var(--muted))]">
              PRODUCT‑MINDSET • CRAFT • APPLIED ML
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 hidden w-full items-center justify-center self-center lg:mt-0 lg:flex"
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 7.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <div className="w-full max-w-[clamp(220px,74vw,540px)]">
            <SplineRobot />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
