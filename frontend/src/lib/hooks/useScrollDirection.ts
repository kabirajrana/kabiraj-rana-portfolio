"use client";

import { useRef, useState } from "react";

import { useMotionValueEvent, useScroll } from "framer-motion";

type Options = {
  threshold?: number;
  topOffset?: number;
  scrolledOffset?: number;
};

export function useScrollDirection(options: Options = {}) {
  const { threshold = 8, topOffset = 24, scrolledOffset = 8 } = options;
  const { scrollY } = useScroll();

  const prevRef = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = prevRef.current;
    prevRef.current = latest;

    setScrolled(latest > scrolledOffset);

    const delta = latest - prev;
    if (Math.abs(delta) < threshold) return;

    if (latest < topOffset) {
      setHidden(false);
      return;
    }

    setHidden(delta > 0);
  });

  return { hidden, scrolled };
}
