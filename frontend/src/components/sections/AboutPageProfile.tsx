"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

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
    title: "Self-Taught Foundation",
    period: "2017–2018",
    label: "The Curiosity Phase",
    summary:
      "Began with QBasic experimentation and Visual Studio fundamentals. Transitioned into HTML, CSS, and JavaScript — developing strong frontend architecture instincts and UI systems thinking.",
    focusTitle: "Core Stack",
    focus: ["QBasic", "HTML", "CSS", "JavaScript", "Bootstrap"],
  },
  {
    title: "Technical Lead — CyberUtsav 2.0",
    period: "Tribhuvan Modern School (2020–2022)",
    label: "Role: Student Technical Lead & Systems Coordinator",
    summary:
      "Led technical execution for a school-level hackathon initiative. Designed event architecture, managed technical workflows, and supported cloud-based collaboration systems.",
    focusTitle: "Focus Areas",
    focus: ["APIs", "Cloud Systems", "Event Architecture", "Leadership"],
  },
  {
    title: "Web Developer — Nexus Event & IT Solutions",
    period: "Jan 2025 – Present",
    label: "",
    summary:
      "Developing scalable web applications and production-grade digital systems. Focused on performance optimization and modern full-stack architecture.",
    focusTitle: "Stack",
    focus: ["Next.js", "React", "TypeScript", "Node.js", "MongoDB"],
  },
];

const certifications = [
  "IBM Data Science Professional Certificate",
  "Microsoft AI Engineer — Coursera",
  "Machine Learning A-Z — Udemy",
  "Deep Learning Specialization — Udemy",
  "AI For Everyone — DeepLearning.AI",
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
  const [activeJourney, setActiveJourney] = useState(0);
  const journeyRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start end", "end start"],
  });
  const auraOpacity = useTransform(scrollYProgress, [0, 0.25, 0.6, 1], [0.12, 0.26, 0.42, 0.2]);
  const auraScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1.06, 1]);
  const nearLayerY = useTransform(scrollYProgress, [0, 1], [-14, 14]);
  const farLayerY = useTransform(scrollYProgress, [0, 1], [12, -12]);

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

      <motion.div
        ref={journeyRef}
        {...reveal}
        className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/35 via-black/25 to-black/35 p-6 backdrop-blur-xl md:p-8"
      >
        <motion.div
          aria-hidden="true"
          style={{ opacity: auraOpacity, scale: auraScale }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22)_0%,rgba(251,191,36,0.09)_40%,transparent_72%)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 2px, transparent 4px), repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 2px, transparent 5px)",
          }}
        />
        <motion.div
          aria-hidden="true"
          style={{
            y: farLayerY,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.22) 0.7px, transparent 0.7px), radial-gradient(rgba(255,255,255,0.12) 0.6px, transparent 0.6px)",
            backgroundPosition: "0 0, 12px 12px",
            backgroundSize: "24px 24px",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
        />
        <motion.div
          aria-hidden="true"
          style={{ y: nearLayerY }}
          animate={{ opacity: [0.15, 0.32, 0.15], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,rgba(251,191,36,0.08)_42%,transparent_72%)] blur-3xl"
        />
        <motion.div
          aria-hidden="true"
          style={{ y: farLayerY }}
          animate={{ opacity: [0.22, 0.32, 0.22] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-14 top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.2),transparent_72%)] blur-2xl"
        />

        <div className="relative">
          <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">JOURNEY SYSTEM</p>
          <h2 className="mt-3 font-[var(--font-serif)] text-3xl tracking-tight md:text-4xl">
            Engineering My Intelligence. Building My Systems.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[rgb(var(--muted))] md:text-base">
            From self-taught foundations to production-grade AI systems — a journey defined by iteration, leadership, and applied machine learning.
          </p>

          <div className="relative mt-9 space-y-6 md:space-y-10">
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 md:block">
              <div className="relative h-full w-px bg-gradient-to-b from-cyan-400/70 via-sky-300/65 to-amber-300/75">
                <motion.span
                  aria-hidden="true"
                  animate={{ y: ["-8%", "108%"], opacity: [0, 1, 0] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 top-0 h-16 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-300 to-amber-300 shadow-[0_0_18px_rgba(34,211,238,0.45)]"
                />
              </div>
            </div>

            {timeline.map((item, index) => {
              const left = index % 2 === 0;
              const isActive = activeJourney === index;
              return (
                <div key={item.title} className="relative grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <motion.article
                    onViewportEnter={() => setActiveJourney(index)}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: left ? -40 : 40, filter: "blur(8px)", scale: 0.98 }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1.02 }}
                    animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4, scale: 1.03, borderColor: "rgba(255,255,255,0.26)" }}
                    className={`${left ? "md:col-start-1" : "md:col-start-3"} relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl p-px [background:linear-gradient(135deg,rgba(56,189,248,0.35),rgba(251,191,36,0.2),rgba(56,189,248,0.12))]">
                      <div className="h-full w-full rounded-2xl bg-transparent" />
                    </div>
                    <motion.div
                      aria-hidden="true"
                      initial={{ opacity: 0.08, scale: 0.95 }}
                      whileInView={{ opacity: 0.22, scale: 1 }}
                      animate={isActive ? { opacity: 0.35, scale: 1.05 } : { opacity: 0.16, scale: 1 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_62%)]"
                    />
                    <p className="relative text-[11px] tracking-[0.22em] text-[rgb(var(--muted))]">{item.period}</p>
                    <h3 className="relative mt-2 text-lg font-semibold text-[rgb(var(--fg))] md:text-xl">{item.title}</h3>
                    {item.label ? <p className="relative mt-1 text-sm text-cyan-200/85">{item.label}</p> : null}
                    <p className="relative mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">{item.summary}</p>
                    <p className="relative mt-4 text-[11px] tracking-[0.22em] text-[rgb(var(--muted))]">{item.focusTitle}</p>
                    <p className="relative mt-2 text-xs text-[rgb(var(--fg))]">{item.focus.join(" · ")}</p>
                  </motion.article>

                  <div className="relative mx-auto hidden md:block md:col-start-2">
                    <motion.div
                      aria-hidden="true"
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.15, 1],
                              boxShadow: [
                                "0 0 0 rgba(34,211,238,0)",
                                "0 0 26px rgba(34,211,238,0.58)",
                                "0 0 0 rgba(34,211,238,0)",
                              ],
                            }
                          : {
                              scale: [1, 1.05, 1],
                              boxShadow: [
                                "0 0 0 rgba(34,211,238,0)",
                                "0 0 12px rgba(34,211,238,0.28)",
                                "0 0 0 rgba(34,211,238,0)",
                              ],
                            }
                      }
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.18 }}
                      className="h-4 w-4 rounded-full border border-cyan-200/80 bg-gradient-to-r from-cyan-300/85 to-amber-300/85"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div
        {...reveal}
        className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8"
      >
        <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">FORMAL INTELLIGENCE EXPANSION</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, index) => (
            <motion.article
              key={cert}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5, rotateX: 4, rotateY: -4, scale: 1.02 }}
              style={{ transformPerspective: 900 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.25)] backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl p-px [background:linear-gradient(135deg,rgba(56,189,248,0.35),rgba(255,255,255,0.14),rgba(251,191,36,0.24))]">
                <div className="h-full w-full rounded-2xl bg-transparent" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-amber-300/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-300 group-hover:ring-cyan-300/35 group-hover:shadow-[0_0_32px_rgba(34,211,238,0.18)]" />
              <p className="relative text-sm leading-relaxed text-[rgb(var(--fg))]">{cert}</p>
            </motion.article>
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
