"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Github, Linkedin, Mail, X } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants";
import { useActiveSection, type ActiveSectionId } from "@/lib/hooks/useActiveSection";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const navEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const mobileEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const headerRef = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState<string>("");

  const { hidden, scrolled } = useScrollDirection({ threshold: 8, topOffset: 24, scrolledOffset: 8 });
  const sectionIds = useMemo<ActiveSectionId[]>(
    () => ["home", "about", "projects", "experience", "contact"],
    []
  );
  const activeSection = useActiveSection(sectionIds, { topOffset: 96 });

  useEffect(() => {
    const update = () => setHash(window.location.hash || "");
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    const setNavHeight = () => {
      const navHeight = headerRef.current?.offsetHeight ?? 80;
      document.documentElement.style.setProperty("--nav-h", `${navHeight}px`);
    };

    setNavHeight();
    window.addEventListener("resize", setNavHeight);
    return () => window.removeEventListener("resize", setNavHeight);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items = useMemo(() => NAV_ITEMS, []);
  const year = new Date().getFullYear();

  const activeId = useMemo<ActiveSectionId>(() => {
    if (pathname === "/") return activeSection;

    const currentHash = hash.replace("#", "");
    if (pathname === "/about" && currentHash === "experience") return "experience";
    if (pathname === "/about") return activeSection === "experience" ? "experience" : "about";
    if (pathname.startsWith("/projects")) return "projects";
    if (pathname === "/contact") return "contact";
    return "home";
  }, [activeSection, hash, pathname]);

  const getSectionId = (item: { label: string; href: string }): ActiveSectionId => {
    if (item.label === "Home") return "home";
    if (item.label === "About") return "about";
    if (item.label === "Projects") return "projects";
    if (item.label === "Experience") return "experience";
    return "contact";
  };

  const getItemHref = (item: { label: string; href: string }) => {
    // On the home page, links behave as in-page section navigation.
    if (pathname === "/") {
      const id = getSectionId(item);
      if (id === "about") return "/about";
      return id === "home" ? "/" : `/#${id}`;
    }
    // On other pages, preserve the existing routes.
    return item.href;
  };

  const onNavClick = () => setOpen(false);

  const onSectionNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, id: ActiveSectionId) => {
      setOpen(false);

      const isInPageNav = pathname === "/" || window.location.pathname === pathname;
      if (!isInPageNav) return;

      const targetId = id;

      if (targetId === "home") {
        // Smooth scroll to top.
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
        setHash("");
        return;
      }

      const el = document.getElementById(targetId);
      if (!el) return;

      // Smooth-scroll when the target is on the current page.
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${targetId}`);
      setHash(`#${targetId}`);
    },
    [pathname]
  );

  return (
    <motion.header
      ref={headerRef}
      initial={{ opacity: 0, y: -12 }}
      animate={hidden ? "hidden" : "shown"}
      variants={{
        hidden: {
          y: -88,
          opacity: 0,
          transition: { duration: 0.52, ease: navEase },
        },
        shown: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.52, ease: navEase },
        },
      }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pt-3 md:px-6 md:pt-4">
        <nav
          className={cn(
            "relative flex h-14 items-center justify-between md:h-auto",
            "rounded-full border border-white/10",
            scrolled ? "bg-black/40" : "bg-black/25",
            "px-3 py-2 backdrop-blur-md transition-colors md:px-4 md:py-3"
          )}
          aria-label="Primary"
        >
          <Link href="/" className="inline-flex items-center gap-3 self-center" onClick={onNavClick}>
            <span
              className={cn(
                "h-10 w-10 md:h-12 md:w-12",
                "flex items-center justify-center",
                "rounded-2xl",
                "bg-gradient-to-br from-white/5 to-white/0",
                "backdrop-blur-xl",
                "border border-white/10",
                "shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
                "ring-1 ring-white/5",
                "transition-all duration-300 ease-out",
                "hover:scale-105",
                "hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]",
                "hover:border-cyan-400/30"
              )}
            >
              <Image
                src="/images/logo.png"
                alt="Brand Logo"
                width={24}
                height={24}
                priority
                className="h-6 w-6 object-contain md:h-7 md:w-7"
              />
            </span>
          </Link>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center md:flex">
            <div className="flex items-center gap-7">
              {items.map((item) => {
                const id = getSectionId(item);
                const href = getItemHref(item);
                const active = activeId === id;

                return (
                  <Link
                    key={item.href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => {
                      if (pathname === "/" && id !== "about") {
                        onSectionNavClick(e, id);
                        return;
                      }
                      // Smooth scroll for same-page anchors (e.g., /about#experience).
                      if (href.startsWith(pathname + "#") && id !== "home") {
                        onSectionNavClick(e, id);
                        return;
                      }
                      onNavClick();
                    }}
                    className={cn(
                      "relative px-1 py-2 text-sm font-medium",
                      "text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))]",
                      "hover:[text-shadow:0_0_14px_rgba(var(--accent)_/_0.22)]",
                      active && "text-[rgb(var(--fg))]"
                    )}
                  >
                    <span className="relative inline-block">
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-indicator"
                          transition={{ duration: 0.35, ease: navEase }}
                          className="absolute -bottom-1 left-0 right-0 h-px bg-[rgb(var(--accent))]"
                        />
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/cv/kabiraj-rana-cv.pdf"
              target="_blank"
              rel="noreferrer"
              download
              className={cn(
                "hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium",
                "tracking-[0.18em] text-[rgb(var(--fg))] transition-all",
                "hover:bg-white/10 hover:shadow-[0_0_22px_rgba(var(--accent)_/_0.22)] md:inline-flex"
              )}
            >
              <span aria-hidden="true" className="mr-1">↓</span>
              Download CV
            </a>

            <button
              type="button"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full",
                "border border-white/10 bg-white/5 text-[rgb(var(--fg))] md:hidden"
              )}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-[2px] w-5 rounded bg-current transition-transform",
                    open && "translate-y-[7px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-[7px] h-[2px] w-5 rounded bg-current transition-opacity",
                    open ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-[14px] h-[2px] w-5 rounded bg-current transition-transform",
                    open && "-translate-y-[7px] -rotate-45"
                  )}
                />
              </span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: mobileEase }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[60] bg-black/55 md:hidden"
              />

              <motion.aside
                initial={{ x: 24, opacity: 0, filter: "blur(8px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ x: 24, opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.62, ease: mobileEase }}
                className="fixed right-0 top-0 z-[61] flex h-dvh w-[min(88vw,360px)] flex-col border-l border-white/10 bg-black/80 px-5 pb-6 pt-16 backdrop-blur-xl md:hidden"
                aria-label="Mobile Menu"
              >
                <div className="absolute right-5 top-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[rgb(var(--fg))]"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <motion.nav
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.08 },
                    },
                  }}
                  className="space-y-1.5"
                >
                  {items.map((item) => {
                    const id = getSectionId(item);
                    const href = getItemHref(item);
                    const active = activeId === id;

                    return (
                      <motion.div
                        key={item.href}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          show: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.55, ease: mobileEase },
                          },
                        }}
                      >
                        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="relative">
                          <Link
                            href={href}
                            onClick={(e) => {
                              if (pathname === "/") {
                                onSectionNavClick(e, id);
                                return;
                              }
                              if (href.startsWith(pathname + "#") && id !== "home") {
                                onSectionNavClick(e, id);
                                return;
                              }
                              onNavClick();
                            }}
                            className={cn(
                              "relative block rounded-2xl px-4 py-3 text-lg transition-all",
                              "border border-transparent hover:bg-white/5 hover:border-white/10",
                              active ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))]"
                            )}
                          >
                            {active && (
                              <motion.span
                                layoutId="mobile-nav-indicator"
                                className="absolute inset-0 rounded-2xl border border-white/10 bg-white/10"
                                transition={{ duration: 0.4, ease: mobileEase }}
                              />
                            )}
                            <span className="relative z-[1]">{item.label}</span>
                          </Link>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: mobileEase, delay: 0.22 }}
                  className="mt-6"
                >
                  <div className="flex gap-3">
                    <motion.a
                      href="https://github.com/kabirajrana"
                      target="_blank"
                      rel="noreferrer"
                      onClick={onNavClick}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[rgb(var(--muted))] transition-all hover:border-white/20 hover:text-[rgb(var(--fg))]"
                      aria-label="GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/kabirajrana/"
                      target="_blank"
                      rel="noreferrer"
                      onClick={onNavClick}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[rgb(var(--muted))] transition-all hover:border-white/20 hover:text-[rgb(var(--fg))]"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </motion.a>
                    <motion.a
                      href="mailto:kabirajrana76@gmail.com"
                      onClick={onNavClick}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[rgb(var(--muted))] transition-all hover:border-white/20 hover:text-[rgb(var(--fg))]"
                      aria-label="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </motion.a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: mobileEase, delay: 0.28 }}
                  className="mt-5"
                >
                  <motion.a
                    href="/cv/kabiraj-rana-cv.pdf"
                    target="_blank"
                    rel="noreferrer"
                    download
                    onClick={onNavClick}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5",
                      "text-sm font-medium tracking-[0.16em] text-[rgb(var(--fg))]",
                      "transition-all hover:bg-white/10 hover:shadow-[0_0_22px_rgba(var(--accent)_/_0.22)]"
                    )}
                  >
                    <span aria-hidden="true" className="mr-1">↓</span>
                    Download CV
                  </motion.a>
                </motion.div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
