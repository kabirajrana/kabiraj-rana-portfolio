"use client";

import { useMemo, useState } from "react";

import { ResearchFeaturedItem } from "@/components/research/research-featured-item";
import { ResearchFilters } from "@/components/research/research-filters";
import { ResearchHero } from "@/components/research/research-hero";
import { ResearchListItem } from "@/components/research/research-list-item";
import { ResearchSearch } from "@/components/research/research-search";
import { ResearchStats } from "@/components/research/research-stats";
import { RESEARCH_TRACKS } from "@/lib/research/types";
import type { PublicResearchEntry } from "@/types/research";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function ResearchClientPage({ entries }: { entries: PublicResearchEntry[] }) {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("ALL");
  const [year, setYear] = useState("All Years");
  const [tag, setTag] = useState("All Topics");

  const years = useMemo(() => ["All Years", ...unique(entries.map((entry) => String(entry.year))).sort((a, b) => Number(b) - Number(a))], [entries]);
  const tags = useMemo(() => ["All Topics", ...unique(entries.flatMap((entry) => entry.tags)).sort((a, b) => a.localeCompare(b))], [entries]);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const trackPass = track === "ALL" ? true : entry.type === track;
      const yearPass = year === "All Years" ? true : String(entry.year) === year;
      const tagPass = tag === "All Topics" ? true : entry.tags.includes(tag);
      const queryNeedle = query.trim().toLowerCase();
      const queryPass =
        !queryNeedle ||
        entry.title.toLowerCase().includes(queryNeedle) ||
        entry.summary.toLowerCase().includes(queryNeedle);

      return trackPass && yearPass && tagPass && queryPass;
    });
  }, [entries, query, tag, track, year]);

  const trackLabel = useMemo(() => {
    if (track === "ALL") {
      return "All";
    }

    const found = RESEARCH_TRACKS.find((item) => item.key === track);
    return found?.label ?? track;
  }, [track]);

  const featured = useMemo(() => entries.filter((entry) => entry.featured).slice(0, 3), [entries]);
  const recentPublications = useMemo(() => entries.filter((entry) => entry.type === "PAPER").slice(0, 4), [entries]);

  const stats = useMemo(
    () => ({
      total: entries.length,
      publications: entries.filter((entry) => entry.type === "PAPER").length,
      experiments: entries.filter((entry) => entry.type === "EXPERIMENT").length,
      systems: entries.filter((entry) => entry.type === "SYSTEM").length,
      notes: entries.filter((entry) => entry.type === "NOTE").length,
      thesis: entries.filter((entry) => entry.type === "THESIS").length,
    }),
    [entries],
  );

  return (
    <div className="space-y-12">
      <ResearchHero />
      <ResearchStats {...stats} />

      {featured.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Featured Research</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((entry) => (
              <ResearchFeaturedItem key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      {recentPublications.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Publications</h2>
          <div className="space-y-1 border-t border-border/50">
            {recentPublications.map((entry) => (
              <ResearchListItem key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Research Archive</h2>
        <div className="space-y-4 rounded-xl border border-border/60 bg-surface/30 p-4 md:p-6">
          <ResearchSearch value={query} onChange={setQuery} />
          <ResearchFilters
            label="Research Tracks"
            options={RESEARCH_TRACKS.map((item) => (item.key === "ALL" ? "ALL" : item.key))}
            active={track}
            onChange={setTrack}
          />
          <ResearchFilters label="Year" options={years} active={year} onChange={setYear} />
          <ResearchFilters label="Topic" options={tags} active={tag} onChange={setTag} />
        </div>

        <div className="space-y-1 border-t border-border/50">
          {filtered.length ? (
            filtered.map((entry) => <ResearchListItem key={entry.id} entry={entry} />)
          ) : (
            <p className="py-12 text-sm text-muted">No research entries match current filters.</p>
          )}
        </div>

        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Showing {filtered.length} of {entries.length} outputs
          {track !== "ALL" ? ` • ${trackLabel}` : ""}
        </p>
      </section>
    </div>
  );
}
