"use client";

import { type ComponentType, useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowUpToLine,
  Bot,
  Clipboard,
  Contact,
  FileDown,
  Github,
  Home,
  Linkedin,
  Mail,
  RefreshCw,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

import { useUIEffects } from "@/components/UIProvider";

type MenuItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  shortcut?: string;
  active?: boolean;
  action: () => void | Promise<void>;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type Position = { x: number; y: number };

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const MENU_WIDTH = 236;
const MENU_HEIGHT = 470;
const EDGE_GAP = 10;
const CURSOR_OFFSET = 8;
const EMAIL = "kabirajrana76@gmail.com";
const GITHUB = "https://github.com/kabirajrana";
const LINKEDIN = "https://www.linkedin.com/in/kabirajrana/";
const CV_URL = "/cv/kabiraj-rana-cv.pdf";

function isInteractiveEditor(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (tag === "code" || tag === "pre") return true;
  if (target.isContentEditable) return true;

  const editableParent = target.closest("input, textarea, select, [contenteditable='true'], code, pre");
  return Boolean(editableParent);
}

function computeMenuPosition(rawX: number, rawY: number, width: number, height: number): Position {
  const openLeft = rawX + width + EDGE_GAP > window.innerWidth;
  const openUp = rawY + height + EDGE_GAP > window.innerHeight;

  const preferredX = openLeft ? rawX - width - CURSOR_OFFSET : rawX + CURSOR_OFFSET;
  const preferredY = openUp ? rawY - height - CURSOR_OFFSET : rawY + CURSOR_OFFSET;

  const maxX = Math.max(EDGE_GAP, window.innerWidth - width - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, window.innerHeight - height - EDGE_GAP);

  return {
    x: Math.max(EDGE_GAP, Math.min(preferredX, maxX)),
    y: Math.max(EDGE_GAP, Math.min(preferredY, maxY)),
  };
}

export default function ContextMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { triggerFireworks } = useUIEffects();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [menuSize, setMenuSize] = useState({ width: MENU_WIDTH, height: MENU_HEIGHT });
  const [aiMode, setAiMode] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const rawPositionRef = useRef<Position>({ x: 0, y: 0 });

  const reducedMotion = !isHydrated || Boolean(prefersReducedMotion);

  useEffect(() => {
    setIsHydrated(true);

    const existingMode = window.localStorage.getItem("kr_ai_mode") === "1";
    setAiMode(existingMode);
    document.documentElement.classList.toggle("ai-mode", existingMode);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const closeMenu = () => setVisible(false);

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onAction = async (action: () => void | Promise<void>) => {
    await action();
    closeMenu();
  };

  const navItems = useMemo(
    () => [
      { label: "Home", href: "/", icon: Home },
      { label: "About", href: "/about", icon: UserRound },
      { label: "Projects", href: "/projects", icon: Sparkles },
      { label: "Experience", href: "/about#experience", icon: Wrench },
      { label: "Contact", href: "/contact", icon: Contact },
    ],
    []
  );

  const sections: MenuSection[] = useMemo(
    () => [
      {
        title: "Quick Actions",
        items: [
          {
            id: "refresh",
            label: "Refresh",
            shortcut: "R",
            icon: RefreshCw,
            action: () => window.location.reload(),
          },
          {
            id: "top",
            label: "Back to Top",
            shortcut: "T",
            icon: ArrowUpToLine,
            action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          },
        ],
      },
      {
        title: "Navigation",
        items: navItems.map((item) => ({
          id: item.label.toLowerCase(),
          label: item.label,
          icon: item.icon,
          active: item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]),
          action: () => router.push(item.href),
        })),
      },
      {
        title: "Productivity / Share",
        items: [
          {
            id: "copy-url",
            label: "Copy Page URL",
            icon: Clipboard,
            action: async () => {
              await navigator.clipboard.writeText(window.location.href);
            },
          },
          {
            id: "copy-email",
            label: "Copy Email",
            icon: Mail,
            action: async () => {
              await navigator.clipboard.writeText(EMAIL);
            },
          },
          {
            id: "download-cv",
            label: "Download CV",
            icon: FileDown,
            action: () => openExternal(CV_URL),
          },
        ],
      },
      {
        title: "Social",
        items: [
          {
            id: "github",
            label: "GitHub",
            icon: Github,
            action: () => openExternal(GITHUB),
          },
          {
            id: "linkedin",
            label: "LinkedIn",
            icon: Linkedin,
            action: () => openExternal(LINKEDIN),
          },
        ],
      },
      {
        title: "Fun",
        items: [
          {
            id: "ai-mode",
            label: aiMode ? "AI Mode (On)" : "AI Mode",
            icon: Bot,
            active: aiMode,
            action: () => {
              const next = !aiMode;
              setAiMode(next);
              window.localStorage.setItem("kr_ai_mode", next ? "1" : "0");
              document.documentElement.classList.toggle("ai-mode", next);
            },
          },
          {
            id: "surprise",
            label: "Surprise Me",
            icon: Sparkles,
            action: async () => {
              closeMenu();
              await triggerFireworks();
            },
          },
        ],
      },
    ],
    [aiMode, navItems, pathname, router, triggerFireworks]
  );

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      if (event.shiftKey) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      if (isInteractiveEditor(event.target) || isInteractiveEditor(document.activeElement)) return;

      event.preventDefault();

      rawPositionRef.current = { x: event.clientX, y: event.clientY };
      const next = computeMenuPosition(event.clientX, event.clientY, menuSize.width, menuSize.height);
      setPosition(next);
      setVisible(true);
    };

    window.addEventListener("contextmenu", onContextMenu);
    return () => window.removeEventListener("contextmenu", onContextMenu);
  }, [menuSize.height, menuSize.width]);

  useEffect(() => {
    if (!visible) return;

    const onPointerDown = (event: PointerEvent) => {
      const menuNode = menuRef.current;
      if (!menuNode) return;
      const target = event.target;
      if (!(target instanceof Element) || !menuNode.contains(target)) {
        closeMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        window.location.reload();
      }
      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        closeMenu();
      }
    };

    const onReflowClose = () => closeMenu();

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onReflowClose, true);
    window.addEventListener("resize", onReflowClose);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onReflowClose, true);
      window.removeEventListener("resize", onReflowClose);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const menuNode = menuRef.current;
    if (!menuNode) return;

    const rect = menuNode.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const nextSize = { width: rect.width, height: rect.height };
    if (nextSize.width !== menuSize.width || nextSize.height !== menuSize.height) {
      setMenuSize(nextSize);
    }

    const clamped = computeMenuPosition(rawPositionRef.current.x, rawPositionRef.current.y, rect.width, rect.height);
    if (clamped.x !== position.x || clamped.y !== position.y) {
      setPosition(clamped);
    }
  }, [visible, menuSize.height, menuSize.width, position.x, position.y]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.22, ease: EASE }}
          aria-label="Custom context menu layer"
        >
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Kabiraj quick actions"
            className="absolute w-[236px] overflow-hidden rounded-xl border border-white/10 bg-black/72 p-1.5 shadow-[0_16px_34px_rgba(0,0,0,0.52)] backdrop-blur-xl"
            style={{ left: position.x, top: position.y }}
            initial={{ opacity: 0, y: 6, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, scale: 0.985, filter: "blur(4px)" }}
            transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: EASE }}
          >
            <p className="px-1.5 pb-0.5 pt-1.5 text-[11px] font-medium tracking-wide text-cyan-100/75">kabiraj</p>

            <div>
              {sections.map((section, sectionIndex) => (
                <div key={section.title} className={sectionIndex === 0 ? "" : "my-1.5 border-t border-white/10 pt-0.5"}>
                  <p className="mb-0.5 mt-1.5 px-1 text-[9px] uppercase tracking-[0.22em] text-[rgb(var(--muted))]">{section.title}</p>
                  <motion.ul
                    initial="hidden"
                    animate="show"
                    variants={
                      reducedMotion
                        ? undefined
                        : {
                            hidden: { opacity: 1 },
                            show: { opacity: 1, transition: { staggerChildren: 0.028 } },
                          }
                    }
                    className="space-y-0"
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <motion.li
                          key={item.id}
                          variants={
                            reducedMotion
                              ? undefined
                              : {
                                  hidden: { opacity: 0, y: 3 },
                                  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE } },
                                }
                          }
                        >
                          <motion.button
                            type="button"
                            role="menuitem"
                            onClick={() => void onAction(item.action)}
                            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                            className={`group relative flex h-8 w-full items-center justify-between rounded-md border px-1.5 text-left transition-colors ${
                              item.active
                                ? "border-cyan-400/20 bg-white/5 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                                : "border-transparent text-white/90 hover:border-white/10 hover:bg-white/5"
                            }`}
                          >
                            <span className="relative z-[1] flex min-w-0 items-center gap-1.5">
                              <span className="grid h-4.5 w-4.5 place-items-center rounded-[6px] border border-white/10 bg-black/35">
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="truncate text-[12px] font-medium">{item.label}</span>
                              {item.active && <span className="h-1 w-1 rounded-full bg-cyan-200" aria-hidden="true" />}
                            </span>

                            <span className="relative z-[1] flex items-center text-[10px] tracking-[0.08em] text-[rgb(var(--muted))]">
                              {item.shortcut ? (
                                <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0 text-[10px] font-medium text-white/78">{item.shortcut}</kbd>
                              ) : null}
                            </span>
                          </motion.button>
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
