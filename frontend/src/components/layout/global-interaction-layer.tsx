"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, BrainCircuit, Clipboard, Download, Home, RefreshCcw, Sparkles, Terminal, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { useContextMenu } from "@/hooks/useContextMenu";
import { type SecretKeyword, useSecretKeywords } from "@/hooks/useSecretKeywords";

const MENU_WIDTH = 292;
const MENU_HEIGHT = 336;
const EDGE_GAP = 12;

function clampPosition(x: number, y: number) {
  const maxX = Math.max(EDGE_GAP, window.innerWidth - MENU_WIDTH - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, window.innerHeight - MENU_HEIGHT - EDGE_GAP);

  return {
    x: Math.min(Math.max(x, EDGE_GAP), maxX),
    y: Math.min(Math.max(y, EDGE_GAP), maxY),
  };
}

type SecretTheme = {
  title: string;
  subtitle: string;
  detail: string;
  icon: typeof Bot;
  chip: string;
  glow: string;
};

const SECRET_THEMES: Record<SecretKeyword, SecretTheme> = {
  ai: {
    title: "AI Layer Unlocked",
    subtitle: "Inference stream synchronized.",
    detail: "You discovered the AI mode. This portfolio is tuned for deployable intelligence, not toy demos.",
    icon: Bot,
    chip: "Neural Inference",
    glow: "from-cyan-400/30 via-sky-400/18 to-transparent",
  },
  ml: {
    title: "ML Lab Activated",
    subtitle: "Feature pipeline online.",
    detail: "You reached the model lab. Expect experimentation discipline, measurable metrics, and production constraints.",
    icon: BrainCircuit,
    chip: "Model Systems",
    glow: "from-emerald-400/30 via-cyan-400/20 to-transparent",
  },
  kabi: {
    title: "Kabi Signature Detected",
    subtitle: "Founder channel verified.",
    detail: "Welcome to the hidden signature view. Precision engineering and thoughtful UI are both first-class features here.",
    icon: UserRound,
    chip: "Author Presence",
    glow: "from-indigo-400/30 via-sky-400/20 to-transparent",
  },
};

function SecretKeywordOverlay({ keyword, onClose }: { keyword: SecretKeyword; onClose: () => void }) {
  const theme = SECRET_THEMES[keyword];
  const Icon = theme.icon;

  return (
    <motion.div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${keyword.toUpperCase()} easter egg`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <motion.div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-[0_38px_90px_-48px_rgba(0,0,0,0.95)]",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-90",
          theme.glow,
        )}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.985 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
              {theme.chip}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs text-muted transition-colors hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Close
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-cyan-200">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-text">{theme.title}</h3>
              <p className="mt-1 text-sm text-cyan-100/85">{theme.subtitle}</p>
            </div>
          </div>

          <p className="max-w-[58ch] text-sm leading-relaxed text-muted">{theme.detail}</p>

          <div className="rounded-2xl border border-border/75 bg-background/70 px-4 py-3 text-[0.72rem] uppercase tracking-[0.19em] text-muted">
            Secret trigger recognized: <span className="text-cyan-200">{keyword.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GlobalInteractionLayer() {
  const pathname = usePathname();
  const router = useRouter();

  const { menuState, closeMenu } = useContextMenu(pathname);
  const { activeKeyword, dismiss } = useSecretKeywords(pathname);

  const menuPosition = useMemo(() => {
    if (!menuState.isOpen || typeof window === "undefined") {
      return { x: menuState.x, y: menuState.y };
    }

    return clampPosition(menuState.x, menuState.y);
  }, [menuState.isOpen, menuState.x, menuState.y]);

  const actions = [
    {
      label: "Go Home",
      detail: "Navigate to the landing page",
      icon: Home,
      run: () => router.push("/"),
    },
    {
      label: "Open Projects",
      detail: "Jump to engineering portfolio",
      icon: Sparkles,
      run: () => router.push("/projects"),
    },
    {
      label: "Open GitHub Insights",
      detail: "Visit the built-in GitHub dashboard",
      icon: Terminal,
      run: () => router.push("/github"),
    },
    {
      label: "Download CV",
      detail: "Fetch latest resume PDF",
      icon: Download,
      run: () => {
        window.open("/kabiraj-rana-cv.pdf", "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "Copy Email",
      detail: "Copy contact email to clipboard",
      icon: Clipboard,
      run: async () => {
        await navigator.clipboard.writeText("kabirajrana76@gmail.com");
      },
    },
    {
      label: "Refresh Scene",
      detail: "Hard refresh current page",
      icon: RefreshCcw,
      run: () => window.location.reload(),
    },
  ];

  return (
    <>
      <AnimatePresence>
        {menuState.isOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-[230] cursor-default bg-transparent"
              aria-label="Close context menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            <motion.div
              className="fixed z-[240] w-[292px] overflow-hidden rounded-2xl border border-border/80 bg-surface/95 shadow-[0_26px_70px_-38px_rgba(0,0,0,0.95)] backdrop-blur-xl"
              style={{ left: menuPosition.x, top: menuPosition.y }}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              role="menu"
              aria-label="Custom portfolio context menu"
            >
              <div className="border-b border-border/70 bg-[linear-gradient(130deg,hsl(var(--accent)/0.2),transparent_55%)] px-4 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-200/85">Portfolio Actions</p>
                <p className="mt-1 truncate text-sm text-text">Hello, I&#39;m Kabiraj Rana</p>
                {menuState.targetHref ? <p className="mt-1 truncate text-xs text-muted">{menuState.targetHref}</p> : null}
              </div>

              <div className="p-2">
                {actions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cyan-300/10"
                      onClick={async () => {
                        closeMenu();
                        await action.run();
                      }}
                    >
                      <span className="rounded-lg border border-border/70 bg-background/75 p-2 text-cyan-200">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm text-text">{action.label}</span>
                        <span className="block text-xs text-muted">{action.detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border/70 px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                Hidden triggers: AI, ML, KABI
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeKeyword ? <SecretKeywordOverlay keyword={activeKeyword} onClose={dismiss} /> : null}
      </AnimatePresence>
    </>
  );
}
