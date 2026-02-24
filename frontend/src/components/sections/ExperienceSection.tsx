"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

type ExperienceItem = {
  title: string;
  meta: string;
  detail: string;
};

const EXPERIENCE: ExperienceItem[] = [
  {
    title: "BSc (Hons) Computing with AI",
    meta: "Softwarica College • Coventry University",
    detail:
      "Focused on applied machine learning and software engineering with a product mindset.",
  },
  {
    title: "Full‑Stack Development",
    meta: "Next.js • FastAPI • Databases",
    detail:
      "Building responsive interfaces, reliable APIs, and clean data flows from prototype to production.",
  },
  {
    title: "Data Science Practice",
    meta: "Evaluation • Pipelines • Reporting",
    detail:
      "Turning analysis into decisions with reproducible workflows and clear, metrics-first communication.",
  },
];

export default function ExperienceSection() {
  return (
    <section id="experience" aria-label="Experience" className="relative scroll-mt-28">
      <Reveal>
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">EXPERIENCE</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl tracking-tight md:text-4xl">
              Foundations.
            </h2>
          </div>
          <div className="md:col-span-8">
            <div className="space-y-3">
              {EXPERIENCE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-[rgb(var(--fg))]">
                      {item.title}
                    </p>
                    <p className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">
                      {item.meta}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
