"use client";

import {
  Brain,
  Box,
  Database,
  Flame,
  GitBranch,
  Layers,
  LineChart,
  Link2,
  Network,
  Server,
  TerminalSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const progressEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const skills = [
  { name: "Python", level: 95 },
  { name: "Machine Learning", level: 88 },
  { name: "Data Analysis / Visualization", level: 85 },
  { name: "Deep Learning", level: 80 },
  { name: "MLOps Basics", level: 75 },
  { name: "FastAPI", level: 85 },
  { name: "SQL", level: 82 },
  { name: "Next.js / TypeScript", level: 80 },
] as const;

type TechItem = {
  name: string;
  icon: LucideIcon;
};

const techGroups: Array<{ heading: string; items: TechItem[] }> = [
  {
    heading: "Core AI/ML",
    items: [
      { name: "Python", icon: TerminalSquare },
      { name: "NumPy", icon: LineChart },
      { name: "Pandas", icon: LineChart },
      { name: "Scikit-learn", icon: Brain },
      { name: "PyTorch", icon: Flame },
    ],
  },
  {
    heading: "Data & Backend",
    items: [
      { name: "FastAPI", icon: Server },
      { name: "PostgreSQL", icon: Database },
      { name: "SQL", icon: Database },
      { name: "Docker", icon: Box },
      { name: "Git", icon: GitBranch },
    ],
  },
  {
    heading: "Applied AI (RAG/Agents)",
    items: [
      { name: "RAG", icon: Network },
      { name: "FAISS", icon: Network },
      { name: "LangChain", icon: Link2 },
      { name: "Agents", icon: Brain },
    ],
  },
  {
    heading: "Web (Minimal)",
    items: [
      { name: "Next.js", icon: Layers },
      { name: "TypeScript", icon: Layers },
      { name: "Tailwind", icon: Layers },
    ],
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease },
  },
};

const skillRowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease, delay: index * 0.1 },
  }),
};

const chipVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease, delay: index * 0.09 },
  }),
};

export default function ExpertiseSection() {
  return (
    <section id="experience" aria-label="My Expertise" className="relative scroll-mt-28">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(88,202,255,0.14),transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent"
        />

        <div className="relative">
          <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">MY EXPERTISE</p>
          <h2 className="mt-3 font-[var(--font-serif)] text-3xl tracking-tight md:text-4xl">
            Technologies & Skills
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))] md:text-base">
            AI-first engineering across model experimentation, data pipelines, production APIs, and focused web delivery.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
            <div className="space-y-5">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  custom={index}
                  variants={skillRowVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.35 }}
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-[rgb(var(--fg))]">{skill.name}</p>
                    <p className="text-xs tracking-[0.12em] text-[rgb(var(--muted))]">{skill.level}%</p>
                  </div>

                  <div className="relative h-[7px] overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
                    <motion.span
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true, amount: 0.45 }}
                      transition={{ duration: 1.15, ease: progressEase, delay: 0.14 + index * 0.08 }}
                      style={{ willChange: "width" }}
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-300/45 via-sky-300/40 to-indigo-300/35"
                    >
                      <motion.span
                        className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border border-white/25 bg-cyan-100/70"
                        initial={{ scale: 0.86, opacity: 0.45 }}
                        whileInView={{ scale: [0.86, 1.08, 0.95], opacity: [0.45, 0.85, 0.62] }}
                        viewport={{ once: true, amount: 0.45 }}
                        transition={{
                          duration: 1.6,
                          ease: progressEase,
                          delay: 0.4 + index * 0.08,
                          repeat: Infinity,
                          repeatType: "mirror",
                        }}
                      />
                      <motion.span
                        aria-hidden="true"
                        initial={{ x: "-65%", opacity: 0 }}
                        whileInView={{ x: "165%", opacity: [0, 0.58, 0] }}
                        viewport={{ once: true, amount: 0.45 }}
                        transition={{
                          duration: 2.8,
                          ease: progressEase,
                          delay: 0.34 + index * 0.08,
                          repeat: Infinity,
                          repeatDelay: 1.05,
                        }}
                        className="absolute inset-y-0 w-10 bg-white/25 blur-[4px]"
                      />
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="hidden w-px bg-gradient-to-b from-transparent via-white/12 to-transparent lg:block" />

            <div className="space-y-5">
              <p className="text-xs tracking-[0.24em] text-[rgb(var(--muted))]">TECHNOLOGIES I WORK WITH</p>

              {techGroups.map((group, groupIndex) => (
                <motion.div
                  key={group.heading}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.9, ease, delay: groupIndex * 0.1 }}
                >
                  <p className="mb-2 text-[11px] tracking-[0.18em] text-[rgb(var(--muted))]">{group.heading}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {group.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const chipIndex = groupIndex * 6 + itemIndex;
                      return (
                        <motion.div
                          key={item.name}
                          custom={chipIndex}
                          variants={chipVariants}
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true, amount: 0.25 }}
                          whileHover={{
                            y: -2,
                            borderColor: "rgba(255,255,255,0.22)",
                            boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                          }}
                          transition={{ duration: 0.35, ease }}
                          className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-black/20 px-3 py-2"
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[rgb(var(--fg))]">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs text-[rgb(var(--muted))] transition-colors group-hover:text-[rgb(var(--fg))]">
                            {item.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
