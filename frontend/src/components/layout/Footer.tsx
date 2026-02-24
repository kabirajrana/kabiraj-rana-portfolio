"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

const easePremium: [number, number, number, number] = [0.16, 1, 0.3, 1];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/about#experience" },
  { label: "Contact", href: "/#contact" },
];

const contactButtons = [
  {
    label: "GitHub",
    href: "https://github.com/kabirajrana",
    external: true,
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kabirajrana/",
    external: true,
    icon: Linkedin,
  },
  {
    label: "Email",
    href: "mailto:kabirajrana76@gmail.com",
    external: false,
    icon: Mail,
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();
  const contactItemClass =
    "group inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] transition-all duration-300 hover:text-[rgb(var(--fg))] hover:[text-shadow:0_0_12px_rgba(var(--accent)_/_0.2)]";

  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: easePremium }}
      className="relative mt-16 border-t border-white/10 bg-black/20 py-14 backdrop-blur-md md:py-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.04] to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="space-y-10 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-10 md:space-y-0">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold tracking-wide text-[rgb(var(--fg))]">
                KR
              </span>
              <span className="text-base font-medium text-[rgb(var(--fg))]">Kabiraj Rana</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              AI/ML Student • Full-Stack Developer • Data Science Enthusiast
            </p>
          </div>

          <div className="hidden flex-col md:flex">
            <p className="text-xs tracking-[0.2em] text-[rgb(var(--muted))]">QUICK LINKS</p>
            <ul className="mt-4 flex flex-nowrap items-center gap-5 overflow-x-auto md:mt-3 md:grid md:grid-cols-1 md:gap-x-0 md:gap-y-2 md:overflow-visible">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center py-1 text-base whitespace-nowrap text-[rgb(var(--muted))] transition-colors duration-300 hover:text-[rgb(var(--fg))] md:py-0 md:text-sm"
                  >
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[rgb(var(--accent))] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <p className="text-xs tracking-[0.2em] text-[rgb(var(--muted))]">CONNECT</p>
            <div className="mt-4 space-y-3 text-sm text-[rgb(var(--muted))] md:mt-3">
              <div className="flex items-center gap-3">
                {contactButtons.map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      aria-label={item.label}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer noopener" : undefined}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[rgb(var(--muted))] transition-all duration-300 hover:border-white/20 hover:text-[rgb(var(--fg))] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] md:h-11 md:w-11"
                    >
                      <Icon className="h-4 w-4 transition-all duration-300 group-hover:brightness-125" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 md:mt-10">
          <div className="text-center text-xs text-[rgb(var(--muted))]">
            <p>© {year} Kabiraj Rana. All rights reserved.</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
