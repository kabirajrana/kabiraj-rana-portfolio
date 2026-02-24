"use client";

import { useEffect, useState } from "react";

export type ActiveSectionId = "home" | "about" | "projects" | "experience" | "contact";

type Options = {
  /** Treat the element as active when it crosses this top offset. */
  topOffset?: number;
};

export function useActiveSection(sectionIds: ActiveSectionId[], options: Options = {}) {
  const { topOffset = 96 } = options;
  const [active, setActive] = useState<ActiveSectionId>(sectionIds[0] ?? "home");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        if (visible.length === 0) return;

        const id = visible[0].target.getAttribute("id") as ActiveSectionId | null;
        if (id) setActive(id);
      },
      {
        root: null,
        // Activate a section when it's near the top half of the viewport.
        rootMargin: `-${topOffset}px 0px -60% 0px`,
        threshold: [0.15, 0.25, 0.4, 0.6],
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionIds, topOffset]);

  return active;
}
