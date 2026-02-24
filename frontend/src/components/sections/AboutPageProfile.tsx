"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { motion, useReducedMotion } from "framer-motion";

const profilePhotoPrimary = "/images/my-photo.jpg";
const profilePhotoFallback = "/images/kabiraj-logo.png";

const toolbelt = [
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Framer Motion",
  "Python",
  "FastAPI",
  "SQL",
  "Git",
];

const exploreNow = ["LLMs", "RAG", "Agents", "MLOps"];

const timeline = [
  {
    title: "Now",
    body: "Building intelligent web products at the intersection of AI/ML and full-stack engineering.",
  },
  {
    title: "Education",
    body: "BSc (Hons) Computing with AI at Softwarica College (Coventry University).",
  },
  {
    title: "Next",
    body: "Internships, research-backed projects, and deeper applied AI systems work.",
  },
];

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setValue(target);
      return;
    }

    let raf = 0;
    const duration = 900;
    const start = performance.now();

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [target, shouldReduceMotion]);

  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}

export default function AboutPageProfile() {
  const shouldReduceMotion = useReducedMotion();
  const [photoSrc, setPhotoSrc] = useState(profilePhotoPrimary);

  const reveal = useMemo(
    () => ({
      initial: shouldReduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(8px)" },
      whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
      viewport: { once: true, amount: 0.2 as const },
      transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
    [shouldReduceMotion]
  );

  return (
    <section id="about" aria-label="Profile" className="relative pt-28">
      <motion.div {...reveal} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
        <div className="grid gap-7 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">PROFILE</p>
            <h1 className="mt-3 font-[var(--font-serif)] text-4xl tracking-tight md:text-5xl">Kabiraj Rana</h1>
            <p className="mt-3 text-sm text-[rgb(var(--muted))] md:text-base">
              AI/ML Student | Full-Stack Developer | Data Science Enthusiast
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted))] md:text-base">
              Focused on building intelligent digital products through modern web engineering and applied machine learning.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
              <div className="rounded-[1.1rem] bg-gradient-to-br from-cyan-400/25 via-transparent to-cyan-500/25 p-[1px]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                  <Image
                    src={photoSrc}
                    alt="Kabiraj Rana"
                    width={700}
                    height={700}
                    className="h-auto w-full object-cover"
                    onError={() => setPhotoSrc(profilePhotoFallback)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-[rgb(var(--muted))]">
              Kathmandu, Nepal
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="grid gap-4">
              <motion.article {...reveal} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-[rgb(var(--fg))]">Principles</p>
                <ul className="mt-2 space-y-2 text-sm text-[rgb(var(--muted))]">
                  <li>• Build with user clarity first, then optimize performance.</li>
                  <li>• Keep systems measurable, maintainable, and production-ready.</li>
                  <li>• Balance engineering discipline with fast experimentation.</li>
                </ul>
              </motion.article>

              <motion.article {...reveal} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-[rgb(var(--fg))]">Toolbelt</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {toolbelt.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[rgb(var(--muted))] transition-all duration-300 hover:border-white/20 hover:text-[rgb(var(--fg))]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.article>

              <motion.article {...reveal} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-[rgb(var(--fg))]">What I’m exploring now</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {exploreNow.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs text-[rgb(var(--fg))]"
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.article>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div {...reveal} className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
        <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">JOURNEY</p>
        <div className="mt-5 space-y-4">
          {timeline.map((item, index) => (
            <motion.div
              key={item.title}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -10, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.52, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-3 border-l border-white/15 pl-4 md:grid-cols-[120px_1fr]"
            >
              <p className="text-xs tracking-[0.22em] text-[rgb(var(--muted))]">{item.title}</p>
              <p className="text-sm leading-relaxed text-[rgb(var(--fg))]">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div {...reveal} className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] tracking-[0.2em] text-[rgb(var(--muted))]">PROJECTS</p>
          <p className="mt-2 text-2xl font-semibold text-[rgb(var(--fg))]">
            <Counter target={12} suffix="+" />
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] tracking-[0.2em] text-[rgb(var(--muted))]">SKILLS</p>
          <p className="mt-2 text-2xl font-semibold text-[rgb(var(--fg))]">
            <Counter target={24} suffix="+" />
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] tracking-[0.2em] text-[rgb(var(--muted))]">LEARNING HOURS</p>
          <p className="mt-2 text-2xl font-semibold text-[rgb(var(--fg))]">
            <Counter target={1200} suffix="+" />
          </p>
        </div>
      </motion.div>

      <motion.div {...reveal} className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
        <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">COLLABORATION</p>
        <h2 className="mt-3 font-[var(--font-serif)] text-2xl tracking-tight md:text-3xl">Let’s collaborate</h2>
        <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))] md:text-base">
          Open to internships, meaningful AI/ML collaboration, and products where intelligent systems can create measurable impact.
        </p>
        <Link
          href="/#contact"
          className="group mt-5 inline-flex items-center gap-2 text-sm text-[rgb(var(--fg))] transition-all duration-300 hover:[text-shadow:0_0_12px_rgba(var(--accent)_/_0.2)]"
        >
          <span className="relative">
            Let’s Talk
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[rgb(var(--accent))] transition-all duration-300 group-hover:w-full" />
          </span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
