"use client";

import { useMemo } from "react";

export type TocItem = { id: string; label: string };

export function ResearchToc({ items }: { items: TocItem[] }) {
  const deduped = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [items]);

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] overflow-auto border-l border-border/50 pl-4 lg:block">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Table of Contents</p>
      <nav className="mt-4 space-y-2 text-sm">
        {deduped.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="block text-muted transition-colors hover:text-text">
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
