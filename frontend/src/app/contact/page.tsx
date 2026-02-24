"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { Clock3, Github, Linkedin, Mail, MapPin } from "lucide-react";

import Navbar from "@/components/layout/Navbar";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Status = "idle" | "sent";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const canSubmit = useMemo(() => email.trim().length > 0 && message.trim().length > 0, [email, message]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sent");
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-[calc(var(--nav-h)+3.5rem)]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-xl md:px-10 md:py-16"
        >
          <motion.div
            aria-hidden="true"
            animate={{ rotate: [0, 6, 0] }}
            transition={{ duration: 20, ease, repeat: Infinity }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          />
          <motion.div
            aria-hidden="true"
            animate={{ rotate: [0, -8, 0] }}
            transition={{ duration: 24, ease, repeat: Infinity }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(120,220,255,0.12),transparent_60%)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/20" />

          <div className="relative mx-auto max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease }}
              className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]"
            >
              CONTACT
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease, delay: 0.08 }}
              className="mt-4 font-[var(--font-serif)] text-4xl tracking-tight md:text-5xl"
            >
              Send a message.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.95, ease, delay: 0.16 }}
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))] md:text-base"
            >
              Share context, constraints, and what success looks like.
            </motion.p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.95, ease, delay: 0.1 }}
          className="mt-8 grid gap-6 lg:grid-cols-12"
        >
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease, delay: 0.12 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-7"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
            <div className="relative">
              <h2 className="text-xl font-medium text-[rgb(var(--fg))]">Send a Message</h2>

              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <label className="grid gap-2">
                  <span className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">FULL NAME (OPTIONAL)</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-[rgb(var(--fg))] outline-none placeholder:text-white/30 transition-all focus:border-white/20 focus:ring-2 focus:ring-white/15"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">EMAIL</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-[rgb(var(--fg))] outline-none placeholder:text-white/30 transition-all focus:border-white/20 focus:ring-2 focus:ring-white/15"
                    placeholder="you@domain.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">SUBJECT (OPTIONAL)</span>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-[rgb(var(--fg))] outline-none placeholder:text-white/30 transition-all focus:border-white/20 focus:ring-2 focus:ring-white/15"
                    placeholder="Project scope, internship, or collaboration"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">MESSAGE</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-36 resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-[rgb(var(--fg))] outline-none placeholder:text-white/30 transition-all focus:border-white/20 focus:ring-2 focus:ring-white/15"
                    placeholder="Tell me what you’re building and what success looks like."
                    required
                  />
                </label>

                <p className="text-xs text-[rgb(var(--muted))]">Typical reply: within 24–48 hours.</p>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex rounded-full border border-white/12 bg-white/[0.06] px-5 py-2.5 text-sm text-[rgb(var(--fg))] transition-all hover:border-white/20 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send Message →
                  </button>
                </div>

                {status === "sent" ? (
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[rgb(var(--muted))]">
                    Message prepared (demo).
                  </p>
                ) : null}
              </form>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease, delay: 0.18 }}
            className="space-y-4 lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
              <div className="relative">
                <h3 className="text-sm tracking-[0.2em] text-[rgb(var(--muted))]">CONTACT DETAILS</h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-[rgb(var(--muted))]">
                    <Mail className="h-4 w-4 text-[rgb(var(--fg))]" />
                    <span>kabirajrana76@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-[rgb(var(--muted))]">
                    <MapPin className="h-4 w-4 text-[rgb(var(--fg))]" />
                    <span>Kathmandu, Nepal (or Remote)</span>
                  </div>
                  <div className="flex items-center gap-3 text-[rgb(var(--muted))]">
                    <Clock3 className="h-4 w-4 text-[rgb(var(--fg))]" />
                    <span>24–48 hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
              <div className="relative">
                <h3 className="text-sm tracking-[0.2em] text-[rgb(var(--muted))]">CONNECT WITH ME</h3>
                <div className="mt-4 grid gap-2.5">
                  <Link
                    href="https://github.com/kabirajrana"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-[rgb(var(--muted))] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-[rgb(var(--fg))]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                  <Link
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-[rgb(var(--muted))] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-[rgb(var(--fg))]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
              <div className="relative">
                <p className="text-sm font-medium text-[rgb(var(--fg))]">Available for opportunities</p>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                  Open to internships, collaboration, and ambitious AI/ML products.
                </p>
              </div>
            </div>
          </motion.aside>
        </motion.section>
      </main>
    </>
  );
}
