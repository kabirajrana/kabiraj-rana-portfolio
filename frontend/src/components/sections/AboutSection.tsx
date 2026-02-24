"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const profileImagePrimary = "/images/kabirajrana.png";
const profileImageFallback = "/images/logo.png";
const chips = ["LLMs", "RAG", "Agents", "MLOps"];

const infoRows = [
  {
    title: "What I build",
    body: "AI-powered web products, practical dashboards, and automation systems with real-world impact.",
  },
  {
    title: "How I work",
    body: "Prototype quickly, validate with data, and ship clean, production-grade systems.",
  },
  {
    title: "What I’m exploring now",
    body: "LLMs, RAG pipelines, agents, and applied MLOps for intelligent software.",
  },
];

export default function AboutSection() {
  const [photoSrc, setPhotoSrc] = useState(profileImagePrimary);

  return (
    <section id="about" aria-label="About" className="relative scroll-mt-28">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.045] via-white/[0.02] to-transparent p-6 shadow-[0_12px_34px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-white/10 opacity-35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-white/10 opacity-30"
        />

        <div className="relative grid items-start gap-8 md:grid-cols-12 md:gap-8">
          <div className="order-2 md:order-1 md:col-span-7">
            <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">ABOUT ME</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl tracking-tight md:text-5xl md:leading-[1.05]">
              Designing practical AI systems with clarity and impact.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgb(var(--muted))] md:text-lg">
              I’m an AI/ML-focused full-stack engineer building production-grade systems with
              modern web architecture and applied machine learning. I care about clarity,
              reliability, and measurable product impact.
            </p>

            <div className="mt-6 space-y-3">
              {infoRows.map((row, index) => (
                <motion.article
                  key={row.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_18px_rgba(var(--accent)_/_0.1)]"
                >
                  <p className="text-sm font-medium text-[rgb(var(--fg))]">{row.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[rgb(var(--muted))]">{row.body}</p>
                </motion.article>
              ))}
            </div>

            <motion.div
              whileHover={{ x: 2 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-sm text-[rgb(var(--fg))] transition-all duration-300 hover:[text-shadow:0_0_10px_rgba(var(--accent)_/_0.16)]"
              >
                <span className="relative">
                  Explore my story
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[rgb(var(--accent))] transition-all duration-300 group-hover:w-full" />
                </span>
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </motion.div>
          </div>

          <motion.aside
            whileHover={{ y: -2 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 md:order-2 md:col-span-5 md:pl-2"
          >
            <div className="relative mx-auto max-w-[260px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 44%, rgba(56,234,255,0.14), rgba(56,234,255,0.03) 38%, transparent 65%)",
                }}
              />

              <div className="relative mx-auto w-fit pb-8">
                <div className="rounded-full bg-gradient-to-br from-cyan-300/25 via-white/10 to-cyan-500/20 p-[1px] shadow-[0_0_26px_rgba(var(--accent)_/_0.12)]">
                  <div className="relative h-[220px] w-[220px] overflow-hidden rounded-full border border-white/10 bg-black/35 ring-1 ring-white/10">
                    <Image
                      src={photoSrc}
                      alt="Kabiraj Rana"
                      fill
                      onError={() => setPhotoSrc(profileImageFallback)}
                      className="rounded-full object-cover object-[center_22%]"
                      priority
                    />
                  </div>
                </div>

                <span className="absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-4 py-1.5 text-[10px] tracking-[0.1em] text-[rgb(var(--fg))] backdrop-blur">
                  Focus: AI / ML
                </span>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[rgb(var(--muted))]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.div>
    </section>
  );
}
