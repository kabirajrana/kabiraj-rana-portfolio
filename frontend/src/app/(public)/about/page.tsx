"use client";

import Image from "next/image";
import { useState } from "react";

import { motion } from "framer-motion";
import { Brain, Database, Rocket, ShieldCheck } from "lucide-react";

import Navbar from "@/components/layout/Navbar";

const chips = ["LLMs", "RAG", "Agents", "MLOps"];

const chapters = [
  {
    id: "beginning",
    title: "The Beginning",
    body: "I started with curiosity for how software shapes daily life, then focused on clean interfaces and solid engineering foundations.",
    highlights: ["Strong fundamentals in modern web architecture", "Focus on clarity-first product building"],
  },
  {
    id: "craft",
    title: "The Shift to AI",
    body: "I moved deeper into AI/ML to build systems that are not only functional, but intelligently adaptive and useful in production.",
    highlights: ["Practical model-to-product thinking", "System design mindset for reliability and scale"],
  },
  {
    id: "today",
    title: "What I build today",
    body: "I build intelligent web products by combining full-stack engineering with applied ML workflows and measurable UX outcomes.",
    highlights: ["AI-powered applications and internal tools", "Production-ready APIs and maintainable codebases", "Data-informed iteration loops"],
  },
  {
    id: "exploring",
    title: "What I’m exploring now",
    body: "I’m currently focused on modern AI systems that connect retrieval, reasoning, and orchestration for real product impact.",
    highlights: ["LLM apps and RAG pipelines", "Agent workflows and tool calling", "MLOps patterns for continuous improvement"],
  },
];

const values = [
  {
    title: "Reliability by Design",
    body: "I architect with stability in mind from day one—clear contracts, resilient APIs, and maintainable abstractions.",
    icon: ShieldCheck,
  },
  {
    title: "Data-Informed Decisions",
    body: "I use metrics and feedback loops to prioritize what matters, improve outcomes, and reduce product guesswork.",
    icon: Database,
  },
  {
    title: "Human-Centered UX",
    body: "Even technical systems should feel intuitive; I balance intelligence with usability and thoughtful interaction design.",
    icon: Brain,
  },
  {
    title: "Iterate to Production",
    body: "I move from fast prototypes to production discipline through validation, refactoring, and pragmatic shipping velocity.",
    icon: Rocket,
  },
];

const MOTION = {
  cardDuration: 0.9,
  nodeDuration: 0.6,
  pulseDuration: 3,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  stagger: 0.16,
};

const timelineListVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: MOTION.stagger,
      delayChildren: 0.06,
    },
  },
};

const timelineCardVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: MOTION.cardDuration,
      ease: MOTION.ease,
      delay: index * MOTION.stagger,
    },
  }),
};

const timelineNodeVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION.nodeDuration, ease: MOTION.ease },
  },
};

const approachContainerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const approachCardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

function ApproachCard({
  value,
}: {
  value: {
    title: string;
    body: string;
    icon: typeof ShieldCheck;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = value.icon;

  return (
    <motion.article
      variants={approachCardVariants}
      whileHover={{ y: -3 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/15 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10)]"
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-30" />

      <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] text-[rgb(var(--fg))]">
        <span className="pointer-events-none absolute inset-y-0 -left-6 w-4 -skew-x-12 bg-white/30 opacity-0 transition-all duration-700 group-hover:left-12 group-hover:opacity-30" />
        <Icon className="relative h-4 w-4" />
      </span>

      <h3 className="relative mt-3 text-sm font-medium text-[rgb(var(--fg))]">{value.title}</h3>

      <p
        className={`relative mt-2 text-sm leading-relaxed text-[rgb(var(--muted))] transition-all duration-300 ${
          expanded ? "line-clamp-none" : "line-clamp-4"
        }`}
      >
        {value.body}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="relative mt-3 inline-flex w-fit items-center text-xs text-[rgb(var(--fg))] transition-all duration-300 hover:[text-shadow:0_0_10px_rgba(var(--accent)_/_0.16)]"
      >
        <span className="relative">
          {expanded ? "Show less" : "Read more"}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[rgb(var(--accent))] transition-all duration-300 group-hover:w-full" />
        </span>
      </button>
    </motion.article>
  );
}

function MyApproachSection() {
  return (
    <motion.section
      id="approach"
      className="scroll-mt-[calc(var(--nav-h,80px)+1rem)] pt-2"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">MY APPROACH</p>
        <h2 className="mt-3 max-w-3xl font-[var(--font-serif)] text-3xl tracking-tight md:text-4xl">
          How I build — principles that guide my work.
        </h2>

        <motion.div
          variants={approachContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-4"
        >
          {values.map((value) => (
            <ApproachCard key={value.title} value={value} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-[calc(var(--nav-h,80px)+2.5rem)] sm:pt-[calc(var(--nav-h,80px)+3.5rem)]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] via-white/[0.015] to-transparent p-6 backdrop-blur-xl md:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(56,234,255,0.08),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"
          />

          <div className="relative grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-10">
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="order-1"
            >
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10)]">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="relative mx-auto flex w-full max-w-[240px] items-center justify-center pb-8"
                >
                  <div className="pointer-events-none absolute h-[250px] w-[250px] rounded-full border border-white/10 opacity-40" />
                  <div className="pointer-events-none absolute h-[220px] w-[220px] rounded-full border border-white/10 opacity-30" />

                  <div className="relative h-[210px] w-[210px] overflow-hidden rounded-full border border-white/10 bg-black/30 ring-1 ring-white/10">
                    <Image
                      src="/images/kabirajrana.png"
                      alt="Kabiraj Rana"
                      fill
                      sizes="210px"
                      priority
                      className="rounded-full object-cover object-[center_22%]"
                    />
                  </div>

                  <span className="absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 translate-y-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-1.5 text-[10px] tracking-[0.12em] text-[rgb(var(--fg))] backdrop-blur">
                    AI / ML
                  </span>
                </motion.div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-[rgb(var(--muted))]">
                  <p className="font-medium text-[rgb(var(--fg))]">// about.ts</p>
                  <p className="mt-1">const role = "AI/ML + Full-Stack";</p>
                </div>
              </div>
            </motion.aside>

            <section id="experience" className="order-2 scroll-mt-[calc(var(--nav-h,80px)+1rem)] space-y-10">
              <motion.header
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">MY STORY</p>
                <h1 className="mt-3 max-w-3xl font-[var(--font-serif)] text-4xl leading-tight tracking-tight md:text-5xl">
                  From curiosity to building intelligent systems.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgb(var(--muted))] md:text-lg">
                  I design practical AI-driven products with clean architecture and product thinking—
                  blending modern engineering discipline with applied machine learning.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[rgb(var(--muted))]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.header>

              <div className="relative pl-5">
                <div className="pointer-events-none absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

                <motion.div
                  className="space-y-4"
                >
                  {chapters.map((chapter, index) => (
                    <motion.article
                      key={chapter.id}
                      id={chapter.id}
                      custom={index}
                      variants={timelineCardVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.25 }}
                      whileHover={{
                        y: -2,
                        borderColor: "rgba(255,255,255,0.22)",
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.10)",
                      }}
                      transition={{ duration: 0.45, ease: MOTION.ease }}
                      className="group relative scroll-mt-[calc(var(--nav-h,80px)+1rem)] rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl"
                    >
                      <div className="absolute -left-[23px] top-5">
                        <motion.span
                          aria-hidden="true"
                          animate={{ scale: [1, 1.06, 1], opacity: [0.1, 0.22, 0.1] }}
                          transition={{
                            duration: MOTION.pulseDuration,
                            ease: MOTION.ease,
                            repeat: Infinity,
                            repeatType: "mirror",
                            delay: index * 0.08,
                          }}
                          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10"
                        />
                        <motion.span variants={timelineNodeVariants} className="relative block h-5 w-5">
                          <span className="absolute inset-0 rounded-full border border-white/18 bg-white/[0.04] backdrop-blur-[2px]" />
                          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(99,210,255,0.18)_0%,rgba(99,210,255,0)_72%)] opacity-35 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-50 group-hover:scale-[1.04]" />
                          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100/70" />
                        </motion.span>
                      </div>

                      <h2 className="text-lg font-medium text-[rgb(var(--fg))]">{chapter.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">{chapter.body}</p>

                      <ul className="mt-3 space-y-1.5 text-sm text-[rgb(var(--muted))]">
                        {chapter.highlights.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))]/60" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.article>
                  ))}
                </motion.div>
              </div>

              <MyApproachSection />

              <motion.blockquote
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="mx-auto mt-8 max-w-2xl text-center"
                >
                  <p className="font-[var(--font-serif)] text-xl italic leading-relaxed text-[rgb(var(--fg))] md:text-2xl">
                    “Ship small, learn fast, and let the product prove the idea.”
                  </p>
                  <footer className="mt-2 text-sm text-[rgb(var(--muted))]">— Kabiraj Rana</footer>
                </motion.blockquote>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
