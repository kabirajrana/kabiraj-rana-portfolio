"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { NAV_ITEMS } from "@/lib/constants";
import type { ActiveSectionId } from "@/lib/hooks/useActiveSection";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const navEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const headerRef = useRef<HTMLElement | null>(null);

  const [hash, setHash] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { hidden, scrolled } = useScrollDirection({ threshold: 8, topOffset: 24, scrolledOffset: 8 });

  useEffect(() => {
    const update = () => setHash(window.location.hash || "");
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    setHash(window.location.hash || "");
  }, [pathname]);

  useEffect(() => {
    const setNavHeight = () => {
      const navHeight = headerRef.current?.offsetHeight ?? 80;
      document.documentElement.style.setProperty("--nav-h", `${navHeight}px`);
    };

    setNavHeight();
    window.addEventListener("resize", setNavHeight);
    return () => window.removeEventListener("resize", setNavHeight);
  }, []);

  const items = useMemo(() => NAV_ITEMS, []);
  const activeId = useMemo<ActiveSectionId>(() => {
    const hashId = hash.replace("#", "") as ActiveSectionId;

    if (pathname === "/") {
      if (["about", "projects", "experience", "contact"].includes(hashId)) {
        return hashId;
      }
      return "home";
    }

    if (pathname === "/about" && hashId === "experience") return "experience";
    if (pathname === "/about") return "about";
    if (pathname === "/experience") return "experience";
    if (pathname.startsWith("/projects")) return "projects";
    if (pathname === "/contact") return "contact";
    return "home";
  }, [hash, pathname]);

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
      if (id === "experience") return "/experience";
      return id === "home" ? "/" : `/#${id}`;
    }
    // On other pages, preserve the existing routes.
    return item.href;
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, hash]);

  const onNavClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const onSectionNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, id: ActiveSectionId) => {
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
          <Link
            href="/"
            className="inline-flex items-center gap-3 self-center"
            onClick={() => {
              setHash("");
              onNavClick();
            }}
          >
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

          <div className="mx-2 hidden flex-1 items-center justify-center overflow-hidden md:absolute md:left-1/2 md:top-1/2 md:mx-0 md:flex md:-translate-x-1/2 md:-translate-y-1/2 md:overflow-visible">
            <div className="no-scrollbar flex max-w-full items-center gap-3 overflow-x-auto px-1 sm:gap-4 md:gap-7 md:overflow-visible md:px-0">
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
                      if (pathname === "/" && id !== "about" && id !== "experience") {
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
                      "relative shrink-0 px-1 py-2 text-xs font-medium sm:text-sm",
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

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-menu"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[rgb(var(--fg))] md:hidden",
              "transition-all hover:bg-white/10 hover:shadow-[0_0_18px_rgba(var(--accent)_/_0.2)]"
            )}
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
            <span className="sr-only">Toggle menu</span>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href="/cv/kabiraj-rana-cv.pdf"
              target="_blank"
              rel="noreferrer"
              download
              className={cn(
                "inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-medium sm:px-4 sm:text-xs",
                "tracking-[0.18em] text-[rgb(var(--fg))] transition-all",
                "hover:bg-white/10 hover:shadow-[0_0_22px_rgba(var(--accent)_/_0.22)]"
              )}
            >
              <span aria-hidden="true" className="mr-1">↓</span>
              Download CV
            </a>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close mobile menu"
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.34, ease: navEase }}
                  className="fixed inset-0 z-[45] bg-black/35 backdrop-blur-[1px] md:hidden"
                />

                <motion.div
                  id="mobile-primary-menu"
                  initial={{ opacity: 0, y: -16, scale: 0.96, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, scale: 0.975, filter: "blur(10px)" }}
                  transition={{ duration: 0.42, ease: navEase }}
                  className="absolute left-3 right-3 top-[calc(100%+0.55rem)] z-[50] rounded-2xl border border-white/15 bg-[#070b12]/95 p-2.5 shadow-[0_16px_34px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:hidden"
                  style={{ transformOrigin: "top center" }}
                >
                  <div className="flex flex-col gap-1">
                    {items.map((item, index) => {
                      const id = getSectionId(item);
                      const href = getItemHref(item);
                      const active = activeId === id;

                      return (
                        <motion.div
                          key={`mobile-wrap-${item.href}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.28, delay: 0.12 + index * 0.05, ease: navEase }}
                          whileTap={{ scale: 0.985 }}
                        >
                          <Link
                            key={`mobile-${item.href}`}
                            href={href}
                            aria-current={active ? "page" : undefined}
                            onClick={(e) => {
                              if (pathname === "/" && id !== "about" && id !== "experience") {
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
                              "block rounded-xl px-3 py-2.5 text-[0.95rem] font-medium",
                              "text-[rgb(var(--muted))] transition-all duration-200",
                              "hover:bg-white/[0.06] hover:text-[rgb(var(--fg))]",
                              active && "border border-cyan-300/20 bg-cyan-200/[0.08] text-[rgb(var(--fg))]"
                            )}
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      );
                    })}

                    <motion.a
                      href="/cv/kabiraj-rana-cv.pdf"
                      target="_blank"
                      rel="noreferrer"
                      download
                      whileTap={{ scale: 0.985 }}
                      className={cn(
                        "mt-1 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2 text-[11px] font-semibold",
                        "tracking-[0.1em] text-[rgb(var(--fg))] transition-all duration-200 hover:bg-white/[0.12]"
                      )}
                    >
                      <span aria-hidden="true" className="mr-1">↓</span>
                      Download CV
                    </motion.a>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </motion.header>
  );
}
