"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

export default function Hero() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section
      id="home"
      className="relative scroll-mt-28 overflow-x-clip pt-[calc(var(--nav-h,80px)+36px)] md:pt-[calc(var(--nav-h,80px)+48px)] lg:pt-[calc(var(--nav-h,80px)+64px)]"
    >
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 xl:gap-16">
        <div className="mx-auto w-full max-w-[600px] text-center md:mx-0 md:text-left">
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
              "mt-6 font-[var(--font-serif)] text-5xl sm:text-6xl md:text-7xl",
              "leading-[0.92] tracking-tight"
            )}
          >
            Kabiraj Rana
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-8 text-sm font-medium tracking-wide text-[rgb(var(--fg))] md:text-base"
          >
            <span className="text-[rgb(var(--accent))]">Aspiring AI/ML Engineer</span> • Full-Stack Developer • Applied Machine Learning Builder
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="mx-auto mt-8 max-w-[600px] text-base leading-8 text-[rgb(var(--muted))] md:mx-0"
          >
            BSc (Hons) Computing with AI at Softwarica College (Coventry University). I
            build intelligent digital products where modern web engineering meets applied
            machine learning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start"
          >
            <Link
              href="/projects"
              className={cn(
                "group inline-flex items-center justify-center gap-2 rounded-full",
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
                "inline-flex items-center justify-center gap-2 rounded-full border",
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
            className="mt-8 flex items-center justify-center gap-4 md:justify-start"
          >
            <div className="h-px w-10 bg-white/10" />
            <p className="text-xs tracking-[0.22em] text-[rgb(var(--muted))]">
              PRODUCT‑MINDSET • CRAFT • APPLIED ML
            </p>
          </motion.div>
        </div>

        <motion.div
          className="order-2 mt-2 hidden w-full items-center justify-center self-center md:order-none md:mt-0 md:flex"
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 8.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <motion.div
            className="relative h-[250px] w-full max-w-[clamp(210px,64vw,470px)] overflow-hidden rounded-2xl sm:h-[290px] md:h-[350px] lg:h-[420px] xl:h-[470px]"
          >
            <motion.div
              className="relative h-full w-full"
              animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={reduceMotion ? undefined : { duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/robotai.png"
                alt="AI robot illustration"
                fill
                sizes="(max-width: 640px) 250px, (max-width: 768px) 290px, (max-width: 1024px) 350px, (max-width: 1280px) 420px, 470px"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
