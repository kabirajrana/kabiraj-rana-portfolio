"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResearchFeaturedItem } from "@/components/research/research-featured-item";
import { ResearchFilters } from "@/components/research/research-filters";
import { ResearchHero } from "@/components/research/research-hero";
import { ResearchListItem } from "@/components/research/research-list-item";
import { ResearchSearch } from "@/components/research/research-search";
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
    detail:
      "Conducting original research on [thesis topic]. Currently in data collection and model training phase. Expected submission: June 2026.",
  },
];

const researchAreaLabels = ["Computer Vision", "Classical ML", "Data Systems", "Applied AI"];
const researchAreaValues = [40, 35, 15, 10];
const focusAreaTopicMatchers: Record<string, string[]> = {
  "Computer Vision": ["computer-vision", "cnn", "transfer-learning", "cifar-10"],
  "Classical ML": ["classification", "ensemble", "boosting", "logistic-regression", "svm", "tabular"],
  "Data Systems": ["data-systems", "data-infrastructure", "mlops", "system-design"],
  "Applied AI": ["applied-ai", "applied_ai", "thesis", "deep-learning"],
};

export function ResearchClientPage({ entries }: { entries: PublicResearchEntry[] }) {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("ALL");
  const [year, setYear] = useState("All Years");
  const [tag, setTag] = useState("All Topics");
  const [focusAreaFilter, setFocusAreaFilter] = useState<string | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!isChartReady || !chartCanvasRef.current || typeof window === "undefined") {
      return;
    }

    const chartConstructor = (window as typeof window & { Chart?: new (...args: any[]) => any }).Chart;
    if (!chartConstructor) {
      return;
    }

    chartInstanceRef.current?.destroy();

    const valueLabelPlugin = {
      id: "value-labels",
      afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const values = chart.data.datasets?.[0]?.data ?? [];
        const chartRight = chart.chartArea?.right ?? 0;

        ctx.save();
        ctx.fillStyle = "#00d4ff";
        ctx.font = "600 13px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 212, 255, 0.35)";
        ctx.shadowBlur = 8;

        meta.data.forEach((bar: any, index: number) => {
          const value = values[index];
          if (typeof value === "number") {
            const label = `${value}%`;
            const textWidth = ctx.measureText(label).width;
            const rightCandidateX = bar.x + 10;
            const overflow = rightCandidateX + textWidth > chartRight - 4;

            ctx.textAlign = overflow ? "right" : "left";
            const drawX = overflow ? bar.x - 10 : rightCandidateX;
            ctx.fillText(label, drawX, bar.y);
          }
        });

        ctx.restore();
      },
    };

    const chart = new chartConstructor(chartCanvasRef.current, {
      type: "bar",
      data: {
        labels: researchAreaLabels,
        datasets: [
          {
            data: researchAreaValues,
            backgroundColor: (context: any) => {
              const chart = context.chart;
              const chartArea = chart?.chartArea;
              const label = researchAreaLabels[context.dataIndex];
              const active = !focusAreaFilter || focusAreaFilter === label;
              if (!chartArea) {
                return active ? "rgba(0, 212, 255, 0.7)" : "rgba(0, 212, 255, 0.3)";
              }

              const gradient = chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
              if (active) {
                gradient.addColorStop(0, "rgba(22, 198, 246, 0.92)");
                gradient.addColorStop(1, "rgba(0, 212, 255, 0.76)");
              } else {
                gradient.addColorStop(0, "rgba(22, 198, 246, 0.42)");
                gradient.addColorStop(1, "rgba(0, 212, 255, 0.26)");
              }
              return gradient;
            },
            borderColor: "rgba(0, 212, 255, 0.9)",
            borderWidth: 1,
            borderRadius: 999,
            borderSkipped: false,
            barThickness: 18,
            maxBarThickness: 18,
            barPercentage: 0.72,
            categoryPercentage: 0.88,
          },
        ],
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        animation: {
          duration: 720,
          easing: "easeOutQuart",
        },
        layout: {
          padding: {
            right: 52,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(5, 17, 28, 0.92)",
            borderColor: "rgba(0, 212, 255, 0.3)",
            borderWidth: 1,
            titleColor: "#e6f8ff",
            bodyColor: "#b9d8e8",
          },
        },
        scales: {
          x: {
            min: 0,
            max: 45,
            ticks: {
              display: false,
            },
            border: {
              display: false,
            },
            grid: {
              color: "rgba(255, 255, 255, 0.06)",
              lineWidth: 1,
            },
          },
          y: {
            ticks: {
              color: "#a0b4c8",
              font: {
                size: 13,
                weight: "500",
              },
            },
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
          },
        },
        onClick: (_event: unknown, elements: Array<{ index: number }>) => {
          if (!elements.length) {
            return;
          }

          const index = elements[0]?.index;
          const selectedLabel = typeof index === "number" ? researchAreaLabels[index] : null;
          if (!selectedLabel) {
            return;
          }

          setFocusAreaFilter((current) => (current === selectedLabel ? null : selectedLabel));
        },
      },
      plugins: [valueLabelPlugin],
    });

    chartInstanceRef.current = chart;

    return () => {
      chart.destroy();
      if (chartInstanceRef.current === chart) {
        chartInstanceRef.current = null;
      }
    };
  }, [focusAreaFilter, isChartReady]);

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

      const selectedTopicMatchers = focusAreaFilter ? focusAreaTopicMatchers[focusAreaFilter] ?? [] : [];
      const entryTags = entry.tags.map((item) => item.toLowerCase());
      const areaText = String(entry.researchArea || "").toLowerCase();
      const focusAreaPass =
        !focusAreaFilter ||
        selectedTopicMatchers.some((topic) => entryTags.includes(topic.toLowerCase())) ||
        areaText.includes(focusAreaFilter.toLowerCase());

      return trackPass && yearPass && tagPass && queryPass && focusAreaPass;
    });
  }, [entries, focusAreaFilter, query, tag, track, year]);

  const trackLabel = useMemo(() => {
    if (track === "ALL") {
      return "All";
    }

    const found = RESEARCH_TRACKS.find((item) => item.key === track);
    return found?.label ?? track;
  }, [track]);

  const featured = useMemo(() => {
    const featuredWithoutThesis = entries.filter((entry) => entry.featured && entry.type !== "THESIS");
    const randomForestEntry = entries.find((entry) => entry.slug === "random-forest-vs-xgboost-performance-study");

    if (!randomForestEntry || randomForestEntry.type !== "EXPERIMENT") {
      return featuredWithoutThesis.slice(0, 3);
    }

    const withoutRandomForestDuplicate = featuredWithoutThesis.filter((entry) => entry.id !== randomForestEntry.id);
    return [randomForestEntry, ...withoutRandomForestDuplicate].slice(0, 3);
  }, [entries]);
  const recentPublications = useMemo(() => entries.filter((entry) => entry.type === "PAPER").slice(0, 4), [entries]);
  const pinnedThesis = useMemo(() => entries.find((entry) => entry.type === "THESIS") ?? null, [entries]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(132deg,hsl(var(--background)/0.98)_0%,hsl(var(--surface)/0.94)_56%,hsl(var(--surface-2)/0.9)_100%)] p-5 sm:p-6 md:p-8">
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="afterInteractive"
        onLoad={() => setIsChartReady(true)}
        onReady={() => setIsChartReady(true)}
      />

      <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-[hsl(var(--accent-2)/0.12)] blur-3xl" aria-hidden="true" />

      <div className="relative space-y-12 text-cyan-50">
        <FadeIn durationMs={1280} y={28}>
          <ResearchHero />
        </FadeIn>

      <FadeIn delay={0.06} durationMs={1220} y={18}>
        <section className="rounded-2xl border border-cyan-300/20 bg-surface/30 p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/85">Research Focus Areas</p>
          <div className="mt-4 h-[200px] w-full">
            <canvas ref={chartCanvasRef} aria-label="Research focus area breakdown" role="img" />
          </div>
          {focusAreaFilter ? (
            <p className="mt-3 text-xs text-cyan-200/85">
              Filter active: {focusAreaFilter}. Click the same bar again to clear.
            </p>
          ) : null}
        </section>
      </FadeIn>

      <FadeIn delay={0.08} durationMs={1220} y={18}>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-cyan-50">Research Journey</h2>
          <div className="overflow-x-auto pb-1">
            <div className="journey-wrap relative min-w-[720px]">
              <div className="journey-track-row relative mb-4" aria-hidden="true">
                <div className="journey-track-shell">
                  <span className="journey-progress-line pointer-events-none absolute left-5 right-5 top-1/2 z-0 -translate-y-1/2" />
                  <span className="journey-progress-fill pointer-events-none absolute left-5 top-1/2 z-[1] h-[2px] -translate-y-1/2" />
                  <div className="journey-node-grid relative z-10">
                    <span className="journey-node journey-node-complete" />
                    <span className="journey-node journey-node-complete" />
                    <span className="journey-node journey-node-active" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-4">
              {journey.map((step, index) => (
                <article
                  key={step.title}
                  className={`journey-card relative flex-1 rounded-xl border border-cyan-300/20 bg-surface/40 p-4 ${index === 2 ? "journey-card-active" : ""}`}
                  style={{ animationDelay: `${index * 180}ms` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Stage {index + 1}</p>
                    {index === 2 ? (
                      <Badge className="border-amber-300/40 bg-amber-400/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-100">
                        Current
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-cyan-50">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cyan-100/80">{step.detail}</p>
                </article>
              ))}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {pinnedThesis ? (
        <FadeIn delay={0.1} durationMs={1180} y={18}>
          <section
            className="w-full rounded-2xl p-5 md:p-7"
            style={{
              border: "1px solid rgba(0,212,255,0.35)",
              background: "linear-gradient(135deg, rgba(0,212,255,0.04) 0%, transparent 60%)",
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-cyan-300/45 bg-cyan-400/15 text-cyan-100">FEATURED</Badge>
              <Badge className="border-cyan-300/45 bg-cyan-400/15 text-cyan-100">THESIS</Badge>
            </div>

            <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-cyan-50">
              Explainability and Robustness in Deployed ML Systems - BSc Dissertation 2026
            </h2>
            <p className="mt-2 text-sm text-cyan-100/70">My current primary research output</p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-cyan-300/20 bg-surface/35 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-cyan-300">Research Question</p>
                  <p className="mt-1 text-sm text-cyan-100/85">
                    How can explainable AI techniques (SHAP, LIME) improve trust and transparency in machine learning models deployed in high-stakes domains?
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-cyan-300">Methodology</p>
                  <p className="mt-1 text-sm text-cyan-100/85">Deep Learning + Evaluation</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-cyan-300">Supervisor</p>
                  <p className="mt-1 text-sm text-cyan-100/85">Name to be confirmed</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-cyan-300">Expected Completion</p>
                  <p className="mt-1 text-sm text-cyan-100/85">June 2026</p>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-300/20 bg-surface/35 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-cyan-300">Progress Tracker</p>
                <ul className="mt-3 space-y-3">
                  <li className="flex items-center justify-between gap-3 text-sm text-cyan-100/90">
                    <span>Literature Review</span>
                    <span className="text-cyan-200">Done ✓</span>
                  </li>
                  <li className="flex items-center justify-between gap-3 text-sm text-cyan-100/90">
                    <span>Methodology Design</span>
                    <span className="text-cyan-200">Done ✓</span>
                  </li>
                  <li className="space-y-2 text-sm text-cyan-100/90">
                    <div className="flex items-center justify-between gap-3">
                      <span>Data Collection</span>
                      <span className="text-amber-200">In Progress (60%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-amber-300/25 bg-amber-400/10">
                      <div className="h-full rounded-full bg-amber-300/75" style={{ width: "60%" }} />
                    </div>
                  </li>
                  <li className="flex items-center justify-between gap-3 text-sm text-cyan-100/90">
                    <span>Model Training</span>
                    <span className="text-cyan-100/60">Planned</span>
                  </li>
                  <li className="flex items-center justify-between gap-3 text-sm text-cyan-100/90">
                    <span>Write-up</span>
                    <span className="text-cyan-100/60">Planned</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge className="border-amber-300/35 bg-amber-400/15 text-amber-100">In Progress</Badge>
              <Badge className="border-cyan-300/30 bg-transparent text-cyan-100/85">thesis</Badge>
              <Badge className="border-cyan-300/30 bg-transparent text-cyan-100/85">deep-learning</Badge>
              <Badge className="border-cyan-300/30 bg-transparent text-cyan-100/85">applied-AI</Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" className="border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/10">
                <Link href={pinnedThesis.codeUrl || "#"} target={pinnedThesis.codeUrl ? "_blank" : undefined} rel={pinnedThesis.codeUrl ? "noopener noreferrer" : undefined}>
                  GitHub
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/10">
                <Link href="#">Download Proposal</Link>
              </Button>
            </div>
          </section>
        </FadeIn>
      ) : null}

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

        <style jsx>{`
          .journey-wrap {
            position: relative;
          }

          .journey-progress-line {
            height: 2px;
            background: rgba(0, 212, 255, 0.24);
          }

          .journey-track-row {
            position: relative;
            height: 24px;
          }

          .journey-track-shell {
            position: relative;
            height: 100%;
            border-radius: 999px;
            border: 1px solid rgba(0, 212, 255, 0.16);
            background: linear-gradient(90deg, rgba(0, 212, 255, 0.06), rgba(0, 212, 255, 0.015));
            box-shadow: inset 0 0 14px rgba(0, 212, 255, 0.07);
          }

          .journey-progress-fill {
            width: calc(66% - 5px);
            background: linear-gradient(90deg, rgba(0, 212, 255, 0.92), rgba(0, 212, 255, 0.62));
            box-shadow: 0 0 14px rgba(0, 212, 255, 0.35);
          }

          .journey-node-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: center;
            height: 100%;
          }

          .journey-node {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 999px;
            border: 1px solid rgba(0, 212, 255, 0.6);
            background: rgba(0, 212, 255, 0.35);
            justify-self: center;
          }

          .journey-node-complete {
            background: rgba(0, 212, 255, 0.8);
            box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.15), 0 0 12px rgba(0, 212, 255, 0.18);
          }

          .journey-node-active {
            background: rgba(0, 212, 255, 0.95);
            box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2), 0 0 14px rgba(0, 212, 255, 0.28);
            animation: journeyPulse 1.9s ease-out infinite;
          }

          .journey-card {
            opacity: 0;
            transform: translateY(20px) scale(0.99);
            animation: journeyCardIn 760ms cubic-bezier(0.2, 0.78, 0.28, 1) forwards;
          }

          .journey-card-active {
            box-shadow: 0 0 16px rgba(0, 212, 255, 0.12);
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

          @keyframes journeyPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.5);
            }
            70% {
              transform: scale(1.12);
              box-shadow: 0 0 0 12px rgba(0, 212, 255, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 212, 255, 0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .journey-card {
              opacity: 1;
              transform: none;
              animation: none;
            }

            .journey-node-active {
              animation: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
