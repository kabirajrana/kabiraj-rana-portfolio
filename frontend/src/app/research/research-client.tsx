"use client";

import { useMemo, useState } from "react";

import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResearchFeaturedItem } from "@/components/research/research-featured-item";
import { ResearchFilters } from "@/components/research/research-filters";
import { ResearchHero } from "@/components/research/research-hero";
import { ResearchListItem } from "@/components/research/research-list-item";
import { ResearchSearch } from "@/components/research/research-search";
import { ResearchStats } from "@/components/research/research-stats";
import { RESEARCH_TRACKS } from "@/lib/research/types";
import type { PublicResearchEntry } from "@/types/research";
import Link from "next/link";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toSingleSentence(text: string, fallback: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }

  const firstSentence = cleaned.match(/^[^.!?]+[.!?]?/);
  if (!firstSentence) {
    return cleaned;
  }

  const sentence = firstSentence[0].trim();
  return sentence.endsWith(".") || sentence.endsWith("!") || sentence.endsWith("?") ? sentence : `${sentence}.`;
}

function hasMethodologyField(content: PublicResearchEntry["content"]): content is PublicResearchEntry["content"] & { methodology: string } {
  return "methodology" in content && typeof content.methodology === "string";
}

const journey = [
  {
    title: "Coursework Foundation",
    detail: "Built core understanding of ML theory, statistics, and model evaluation through BSc AI coursework.",
  },
  {
    title: "Applied Experiments",
    detail: "Transitioned from concepts to reproducible experiments across datasets, architectures, and metrics.",
  },
  {
    title: "Thesis Development",
    detail: "Now consolidating findings into a thesis-grade research contribution with practical AI impact.",
  },
];

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
  const pinnedThesis = useMemo(() => entries.find((entry) => entry.type === "THESIS") ?? null, [entries]);

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
    <div className="relative overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(132deg,hsl(var(--background)/0.98)_0%,hsl(var(--surface)/0.94)_56%,hsl(var(--surface-2)/0.9)_100%)] p-5 sm:p-6 md:p-8">
      <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-[hsl(var(--accent-2)/0.12)] blur-3xl" aria-hidden="true" />

      <div className="relative space-y-12 text-cyan-50">
        <FadeIn durationMs={1280} y={28}>
          <ResearchHero />
        </FadeIn>

      {pinnedThesis ? (
        <FadeIn delay={0.06} durationMs={1220} y={18}>
          <section className="rounded-2xl border border-cyan-300/25 bg-surface/40 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="border-cyan-300/45 bg-cyan-400/15 text-cyan-100">
                Pinned Thesis Project
              </Badge>
              <Badge>{pinnedThesis.year}</Badge>
              <Badge>{pinnedThesis.status}</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-cyan-50 md:text-3xl">{pinnedThesis.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-cyan-100/85 md:text-base">
              {toSingleSentence(pinnedThesis.summary, "Current thesis narrative is being refined.")}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Methodology</p>
                <p className="mt-2 text-sm text-cyan-100/85">
                  {toSingleSentence(
                    hasMethodologyField(pinnedThesis.content)
                      ? pinnedThesis.content.methodology
                      : "",
                    "Methodology details will be published soon.",
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Expected Completion</p>
                <p className="mt-2 text-sm text-cyan-100/85">
                  {pinnedThesis.status === "PUBLISHED" ? "Completed" : `Q4 ${pinnedThesis.year}`}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {pinnedThesis.pdfUrl ? (
                <Button asChild variant="outline">
                  <Link href={pinnedThesis.pdfUrl} target="_blank" rel="noopener noreferrer">
                    PDF
                  </Link>
                </Button>
              ) : null}
              {pinnedThesis.codeUrl ? (
                <Button asChild variant="outline">
                  <Link href={pinnedThesis.codeUrl} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href={`/research/${pinnedThesis.slug}`}>View Thesis</Link>
              </Button>
            </div>
          </section>
        </FadeIn>
      ) : null}

      <FadeIn delay={0.08} durationMs={1220} y={18}>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-cyan-50">Research Journey</h2>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-[720px] gap-4">
              {journey.map((step, index) => (
                <article
                  key={step.title}
                  className="journey-card relative flex-1 rounded-xl border border-cyan-300/20 bg-surface/40 p-4"
                  style={{ animationDelay: `${index * 180}ms` }}
                >
                  {index < journey.length - 1 ? <span className="pointer-events-none absolute right-[-18px] top-1/2 h-[2px] w-5 -translate-y-1/2 bg-cyan-300/45" /> : null}
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Stage {index + 1}</p>
                  <h3 className="mt-2 text-base font-semibold text-cyan-50">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cyan-100/80">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1} durationMs={1200} y={22}>
        <ResearchStats {...stats} />
      </FadeIn>

      {featured.length ? (
        <FadeIn delay={0.18} durationMs={1180} y={20}>
          <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-cyan-50">Featured Research</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((entry, index) => (
              <FadeIn key={entry.id} delay={0.08 + index * 0.1} durationMs={1120} y={18}>
                <ResearchFeaturedItem entry={entry} />
              </FadeIn>
            ))}
          </div>
          </section>
        </FadeIn>
      ) : null}

      {recentPublications.length ? (
        <FadeIn delay={0.24} durationMs={1160} y={18}>
          <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-cyan-50">Recent Publications</h2>
          <div className="space-y-1 border-t border-border/50">
            {recentPublications.map((entry, index) => (
              <FadeIn key={entry.id} delay={0.08 + index * 0.08} durationMs={1040} y={14}>
                <ResearchListItem entry={entry} />
              </FadeIn>
            ))}
          </div>
          </section>
        </FadeIn>
      ) : null}

        <FadeIn delay={0.3} durationMs={1180} y={18}>
          <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-cyan-50">Research Archive</h2>
          <div className="space-y-4 rounded-xl border border-cyan-300/20 bg-surface/30 p-4 md:p-6">
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
            filtered.map((entry, index) => (
              <FadeIn key={entry.id} delay={Math.min(0.08 + index * 0.04, 0.4)} durationMs={980} y={12}>
                <ResearchListItem entry={entry} />
              </FadeIn>
            ))
          ) : (
            <FadeIn delay={0.12} durationMs={920} y={10}>
              <p className="py-12 text-sm text-muted">No research entries match current filters.</p>
            </FadeIn>
          )}
        </div>

          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Showing {filtered.length} of {entries.length} outputs
            {track !== "ALL" ? ` • ${trackLabel}` : ""}
          </p>

          <div className="rounded-xl border border-cyan-300/20 bg-surface/35 p-5 md:p-6">
            <h3 className="text-lg font-semibold tracking-tight text-cyan-50">Research Goals</h3>
            <p className="mt-3 text-sm leading-relaxed text-cyan-100/85 md:text-base">
              My next research direction focuses on trustworthy and efficient AI: robust model generalization under data shift,
              practical MLOps systems for continuous evaluation, and explainable ML methods that can be deployed responsibly in
              real-world products. I aim to bridge academic rigor with production-ready engineering so each study contributes to
              measurable social and technical impact.
            </p>
          </div>
          </section>
        </FadeIn>

        <style jsx>{`
          .journey-card {
            opacity: 0;
            transform: translateY(20px) scale(0.99);
            animation: journeyCardIn 760ms cubic-bezier(0.2, 0.78, 0.28, 1) forwards;
          }

          @keyframes journeyCardIn {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.99);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .journey-card {
              opacity: 1;
              transform: none;
              animation: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
