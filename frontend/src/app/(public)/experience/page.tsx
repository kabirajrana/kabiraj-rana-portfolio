"use client";

import { useEffect, useState } from "react";

import { motion, useReducedMotion } from "framer-motion";

import Navbar from "@/components/layout/Navbar";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const experiences = [
  {
    title: "Self Web Developer",
    period: "2021 – Present",
    description:
      "Independently designing and developing scalable web applications and digital systems. Focused on frontend architecture, full-stack integration, and performance optimization across personal and academic projects.",
    tagTitle: "Core Stack",
    tags: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Node.js", "MongoDB"],
  },
  {
    title: "Technical Coordinator — College Initiatives",
    period: "Tribhuvan Modern College · 2021 – 2024",
    description:
      "Supported technical planning and system coordination for college-level initiatives. Assisted in organizing structured workflows, providing technical support, and managing event-based technical environments.",
    tagTitle: "Focus Areas",
    tags: ["System Coordination", "Technical Support", "Event Tech Management", "Team Collaboration"],
  },
] as const;

const certifications = [
  {
    title: "IBM Data Science Professional Certificate",
    href: "https://coursera.org/share/6d7abf000f8949e22b9220d4577869fb",
  },
  {
    title: "Microsoft AI Engineer — Coursera",
    href: "https://coursera.org/share/6d7abf000f8949e22b9220d4577869fb",
  },
  {
    title: "Deep Learning — Udemy",
    href: "https://coursera.org/share/6d7abf000f8949e22b9220d4577869fb",
  },
  {
    title: "Machine Learning — Udemy",
    href: "https://coursera.org/share/6d7abf000f8949e22b9220d4577869fb",
  },
  {
    title: "AI for Everyone — DeepLearning.AI",
    href: "https://coursera.org/share/bcb1acdf1fe4c763862449ab3095094b",
  },
] as const;

export default function ExperiencePage() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = mounted && Boolean(shouldReduceMotion);

  const certificationContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.14,
        delayChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };

  const certificationCard = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }
      : { opacity: 0, y: 34, scale: 0.965, rotateX: 7, filter: "blur(7px)" },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        duration: reduceMotion ? 0.01 : 1.06,
        ease,
      },
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Navbar />

      <motion.main
        initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: reduceMotion ? 0.01 : 0.92, ease }}
        className="relative overflow-hidden bg-gradient-to-b from-black via-[#090909] to-[#131313] pb-24 pt-[calc(var(--nav-h,80px)+2.8rem)]"
      >
        <motion.div
          aria-hidden="true"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.2) 0.8px, transparent 0.8px), radial-gradient(rgba(255,255,255,0.12) 0.7px, transparent 0.7px)",
            backgroundPosition: "0 0, 10px 10px",
            backgroundSize: "20px 20px",
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.16, 0.28, 0.16], scale: [0.96, 1.05, 0.96] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-16 top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_68%)] blur-3xl"
        />

        <section className="relative mx-auto w-full max-w-6xl px-6">
          <motion.header
            initial="hidden"
            animate={mounted ? "show" : "hidden"}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: reduceMotion ? 0 : 0.18,
                  delayChildren: reduceMotion ? 0 : 0.24,
                },
              },
            }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: reduceMotion ? 0.01 : 0.96, ease },
                },
              }}
              className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]"
            >
              EXPERIENCE
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: reduceMotion ? 0.01 : 1.08, ease },
                },
              }}
              className="mx-auto mt-3 max-w-3xl font-[var(--font-serif)] text-3xl leading-tight tracking-tight md:text-4xl lg:text-5xl"
            >
              A journey of learning, iteration, and creation.
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: reduceMotion ? 0.01 : 1.02, ease },
                },
              }}
              className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-[rgb(var(--muted))] md:text-lg"
            >
              From writing my first programs to building structured digital solutions, every milestone has refined my problem-solving and architectural mindset.
            </motion.p>
          </motion.header>

          <div className="relative mt-14 space-y-7 md:space-y-10">
            <div className="pointer-events-none absolute bottom-[-1.5rem] left-1/2 top-[-1rem] z-[1] hidden -translate-x-1/2 md:block">
              <div className="relative h-full w-px bg-white/24">
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-200/50 to-transparent" />
              </div>
            </div>

            {experiences.map((item, index) => {
              const isLeft = index % 2 === 0;
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={item.title}
                  onViewportEnter={() => setActiveIndex(index)}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: isLeft ? -22 : 22,
                          y: 14,
                          filter: "blur(3px)",
                          scale: 0.994,
                        }
                  }
                  whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 }}
                  viewport={{ once: true, amount: 0.62 }}
                  transition={{
                    duration: reduceMotion ? 0.01 : 1.28,
                    ease,
                    delay: 0,
                  }}
                  style={{ willChange: "transform, opacity, filter" }}
                  className="relative grid gap-2 md:grid-cols-[1fr_auto_1fr] md:items-center"
                >
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute top-1/2 hidden h-px -translate-y-1/2 md:block ${
                      isLeft
                        ? "right-1/2 mr-6 w-16 lg:w-24 bg-gradient-to-r from-transparent to-amber-200/28"
                        : "left-1/2 ml-6 w-16 lg:w-24 bg-gradient-to-r from-amber-200/28 to-transparent"
                    }`}
                  />
                  <motion.article
                    animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.78, ease }}
                    whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.2)", boxShadow: "0 0 30px rgba(34,211,238,0.14)" }}
                    className={`${isLeft ? "md:col-start-1 md:justify-self-end" : "md:col-start-3 md:justify-self-start"} relative z-[2] flex h-[282px] w-full sm:max-w-[360px] md:max-w-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-xl shadow-[0_10px_22px_rgba(0,0,0,0.32)]`}
                  >
                    <motion.div
                      aria-hidden="true"
                      animate={isActive ? { opacity: 0.34 } : { opacity: 0.14 }}
                      transition={{ duration: 0.45, ease }}
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(34,211,238,0.2),transparent_66%)]"
                    />

                    <p className="relative text-[11px] tracking-[0.24em] text-[rgb(var(--muted))]">{item.period}</p>
                    <h2 className="relative mt-1 text-base font-semibold leading-tight text-[rgb(var(--fg))] md:text-lg">{item.title}</h2>
                    <p className="relative mt-2 overflow-hidden text-[13px] leading-relaxed text-[rgb(var(--muted))] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                      {item.description}
                    </p>

                    <p className="relative mt-auto text-[10px] tracking-[0.2em] text-[rgb(var(--muted))]">{item.tagTitle}</p>
                    <div className="relative mt-2.5 flex flex-wrap content-start gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/12 bg-black/20 px-2 py-0.5 text-[10px] text-[rgb(var(--muted))] transition-colors duration-300 hover:border-[rgb(var(--accent))]/40 hover:bg-[rgb(var(--accent))]/10 hover:text-[rgb(var(--fg))]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.article>

                  <div className="relative z-[3] mx-auto hidden md:block md:col-start-2">
                    <motion.div
                      aria-hidden="true"
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.14, 1],
                              boxShadow: [
                                "0 0 0 rgba(251,191,36,0)",
                                "0 0 18px rgba(251,191,36,0.48)",
                                "0 0 0 rgba(251,191,36,0)",
                              ],
                            }
                          : {
                              scale: [1, 1.06, 1],
                              boxShadow: [
                                "0 0 0 rgba(251,191,36,0)",
                                "0 0 10px rgba(251,191,36,0.3)",
                                "0 0 0 rgba(251,191,36,0)",
                              ],
                            }
                      }
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.28 }}
                      className="h-4 w-4 rounded-full border border-amber-100/80 bg-gradient-to-r from-amber-100/85 to-amber-300/85"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: reduceMotion ? 0.01 : 1.0, ease }}
            className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_44px_rgba(0,0,0,0.42)] backdrop-blur-xl md:p-8"
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background:radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_84%_76%,rgba(56,189,248,0.12),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent" />

            <div className="relative">
              <div className="mx-auto inline-flex rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-[10px] tracking-[0.24em] text-[rgb(var(--muted))]">
                CERTIFICATIONS
              </div>
              <h3 className="mt-4 text-center font-[var(--font-serif)] text-2xl tracking-tight text-[rgb(var(--fg))] md:text-3xl">
                Formal Intelligence Expansion
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[rgb(var(--muted))]">
                Verified learning tracks shaping deeper AI systems thinking and production execution.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={certificationContainer}
              className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {certifications.map((cert, index) => (
                <motion.article
                  key={cert.title}
                  variants={certificationCard}
                  whileHover={{
                    y: -8,
                    rotateX: 5,
                    rotateY: -5,
                    scale: 1.024,
                    borderColor: "rgba(255,255,255,0.24)",
                    boxShadow: "0 22px 42px rgba(0,0,0,0.42), 0 0 28px rgba(34,211,238,0.18)",
                  }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.58, ease }}
                  style={{ transformPerspective: 1000, willChange: "transform, opacity, filter" }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_26px_rgba(0,0,0,0.3)] backdrop-blur-xl"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl p-px [background:linear-gradient(135deg,rgba(var(--accent),0.35),rgba(255,255,255,0.12),rgba(var(--accent),0.16))]">
                    <div className="h-full w-full rounded-2xl bg-transparent" />
                  </div>
                  {!reduceMotion && (
                    <motion.div
                      aria-hidden="true"
                      animate={{ x: ["-145%", "145%"] }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        repeatDelay: 1 + index * 0.2,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)_/_0.12)] via-transparent to-sky-300/12 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-300 group-hover:ring-[rgb(var(--accent)_/_0.4)] group-hover:shadow-[0_0_28px_rgba(var(--accent)_/_0.2)]" />
                  <span className="relative inline-flex rounded-full border border-white/12 bg-black/35 px-2 py-0.5 text-[10px] tracking-[0.2em] text-[rgb(var(--muted))]">
                    C{index + 1}
                  </span>
                  <p className="relative mt-2 text-sm leading-relaxed text-[rgb(var(--fg))]">
                    {cert.title}
                  </p>
                  <a
                    href={cert.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="relative mt-3 inline-flex items-center text-xs tracking-[0.16em] text-[rgb(var(--muted))] transition-colors duration-300 hover:text-[rgb(var(--fg))]"
                  >
                    View Credential ↗
                  </a>
                </motion.article>
              ))}
            </motion.div>
          </motion.section>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reduceMotion ? 0.01 : 1.0, ease }}
            className="mt-12 text-center font-[var(--font-serif)] text-lg italic text-[rgb(var(--muted))]"
          >
            The journey continues…
          </motion.p>
        </section>
      </motion.main>
    </>
  );
}
