"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={scrollTop}
          className="group fixed bottom-4 right-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-[rgb(var(--fg))] backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.24)] md:bottom-6 md:right-6 md:h-12 md:w-12"
        >
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-cyan-300/25"
            animate={{ scale: [1, 1.18], opacity: [0.16, 0] }}
            transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
          />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-cyan-300/20"
            animate={{ scale: [1, 1.28], opacity: [0.12, 0] }}
            transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity, delay: 0.35 }}
          />
          <motion.span
            whileHover={{ rotate: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="inline-flex"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
