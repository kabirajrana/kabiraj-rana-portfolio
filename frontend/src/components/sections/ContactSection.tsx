"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

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

type Status = "idle" | "sending" | "sent" | "error";
const MIN_MESSAGE_LENGTH = 10;
const SEND_TIMEOUT_MS = 15000;
const SUCCESS_NOTICE = "Thanks for reaching out. I’ll get back to you within 24 hours.";
const SUCCESS_NOTICE_DURATION_MS = 2200;

export default function ContactSection({ standalone }: { standalone?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(() => {
    if (status === "sending") return false;
    if (!email.trim()) return false;
    if (message.trim().length < MIN_MESSAGE_LENGTH) return false;
    return true;
  }, [email, message, status]);

  useEffect(() => {
    if (status !== "sent") return;

    const timerId = window.setTimeout(() => {
      setStatus("idle");
      setNotice("");
    }, SUCCESS_NOTICE_DURATION_MS);

    return () => window.clearTimeout(timerId);
  }, [status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setNotice("");
    setStatus("sending");

    const timeoutMessage = "Request timed out. Please check your connection and try again.";
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

    try {
      const response = await apiFetch("/contact", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, body: message }),
      });
      await response.json();
      setStatus("sent");
      setNotice(SUCCESS_NOTICE);
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      const fallback = "Could not send your message right now. Please try again shortly.";
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice(timeoutMessage);
      } else {
        setNotice(error instanceof Error ? error.message : fallback);
      }
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return (
    <section id="contact" aria-label="Contact" className="relative scroll-mt-28">
      <Reveal>
        {!standalone && (
          <div className="mb-8">
            <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">CONTACT</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl tracking-tight md:text-4xl">
              Let’s build something sharp.
            </h2>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-12">
          <div className={cn("md:col-span-5", standalone && "md:col-span-4")}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="text-sm font-medium text-[rgb(var(--fg))]">Availability</p>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                Open to collaboration and ambitious product work.
              </p>
              <div className="mt-6 h-px w-full bg-white/10" />
              <p className="mt-6 text-xs tracking-[0.22em] text-[rgb(var(--muted))]">
                RESPONSE
              </p>
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                I aim to reply within 24–48 hours.
              </p>
            </div>
          </div>

          <div className={cn("md:col-span-7", standalone && "md:col-span-8")}>
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">
                    NAME (OPTIONAL)
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-[rgb(var(--fg))] outline-none ring-0 placeholder:text-white/30 focus:border-white/20"
                    placeholder="Kabiraj Rana"
                    autoComplete="name"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">
                    EMAIL
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-[rgb(var(--fg))] outline-none ring-0 placeholder:text-white/30 focus:border-white/20"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </label>
              </div>

              <label className="mt-4 grid gap-2">
                <span className="text-xs tracking-[0.18em] text-[rgb(var(--muted))]">
                  MESSAGE
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  minLength={MIN_MESSAGE_LENGTH}
                  className="min-h-32 resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-[rgb(var(--fg))] outline-none ring-0 placeholder:text-white/30 focus:border-white/20"
                  placeholder="Describe your project, objectives, and desired impact."
                />
              </label>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p
                  className={cn(
                    "text-xs",
                    status === "sent" ? "text-cyan-200" : status === "error" ? "text-rose-200" : "text-[rgb(var(--muted))]"
                  )}
                >
                  {notice || `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`}
                </p>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium",
                    "transition-transform",
                    canSubmit
                      ? "bg-[rgb(var(--accent))] text-black hover:-translate-y-0.5"
                      : "cursor-not-allowed bg-white/10 text-white/40"
                  )}
                >
                  {status === "sending" ? "Sending…" : "Send"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
