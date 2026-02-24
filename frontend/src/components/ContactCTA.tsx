"use client";

import Link from "next/link";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ContactCTA() {
  return (
    <section id="contact" aria-label="Contact call to action" className="relative scroll-mt-28">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-xl md:px-8 md:py-16">
        <motion.div
          aria-hidden="true"
          animate={{ rotate: [0, 6, 0] }}
          transition={{ duration: 18, ease, repeat: Infinity }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        />
        <motion.div
          aria-hidden="true"
          animate={{ rotate: [0, -8, 0] }}
          transition={{ duration: 22, ease, repeat: Infinity }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(120,220,255,0.12),transparent_56%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(0,0,0,0.55),transparent_55%)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/20" />
        <span aria-hidden="true" className="pointer-events-none absolute left-[14%] top-[28%] h-1 w-1 rounded-full bg-white/20" />
        <span aria-hidden="true" className="pointer-events-none absolute right-[18%] top-[34%] h-1 w-1 rounded-full bg-white/20" />
        <span aria-hidden="true" className="pointer-events-none absolute left-[24%] bottom-[26%] h-1 w-1 rounded-full bg-white/15" />

        <div className="relative mx-auto max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
            className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]"
          >
            GET IN TOUCH
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease, delay: 0.08 }}
            className="mt-4 font-[var(--font-serif)] text-3xl tracking-tight md:text-5xl"
          >
            Let’s build something that actually ships.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.95, ease, delay: 0.16 }}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))] md:text-base"
          >
            If you’re working on an AI/ML product, a data system, or a modern web app—tell me the goal and timeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.95, ease, delay: 0.2 }}
            className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease, delay: 0.28 }}
            className="mt-8"
          >
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm tracking-[0.08em] text-[rgb(var(--fg))] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.09]"
            >
              Send a message →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
