"use client";

import { type ReactNode, useEffect, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type PageTransitionProps = {
  children: ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reducedMotion = Boolean(useReducedMotion());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [isMounted, pathname, reducedMotion]);

  if (!isMounted) {
    return <div>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: reducedMotion ? 0.18 : 0.68, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
