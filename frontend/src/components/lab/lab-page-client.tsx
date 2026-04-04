"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ExperimentStatus = "Completed" | "In Progress" | "Planned";

type ExperimentRow = {
  model: string;
  dataset: string;
  accuracy: string;
  f1: string;
  date: string;
  notes: string;
  status: ExperimentStatus;
};

type NotebookCard = {
  title: string;
  description: string;
  stack: string[];
  colabUrl: string;
};

const experimentRows: ExperimentRow[] = [
  {
    model: "CNN Image Classifier",
    dataset: "CIFAR-10 Subset",
    accuracy: "91.4%",
    f1: "0.90",
    date: "2026-03-28",
    notes: "Transfer learning with EfficientNet baseline and custom augmentation.",
    status: "Completed",
  },
  {
    model: "Random Forest Comparator",
    dataset: "Synthetic Decision Boundary Set",
    accuracy: "87.6%",
    f1: "0.86",
    date: "2026-04-01",
    notes: "Tuning tree depth and estimator count against non-linear boundaries.",
    status: "In Progress",
  },
  {
    model: "Logistic Regression Baseline",
    dataset: "Tabular Binary Benchmark",
    accuracy: "82.1%",
    f1: "0.80",
    date: "2026-04-10",
    notes: "Planned baseline for calibration and feature-scaling experiments.",
    status: "Planned",
  },
];

const notebooks: NotebookCard[] = [
  {
    title: "CNN Transfer Learning Playbook",
    description:
      "End-to-end notebook for image preprocessing, transfer-learning strategy, and confidence calibration. It covers practical fine-tuning decisions, validation diagnostics, and deployment-ready evaluation notes for real-world image classification workflows.",
    stack: ["Python", "PyTorch", "OpenCV", "Grad-CAM"],
    colabUrl: "https://colab.research.google.com/",
  },
  {
    title: "Model Comparator: RF vs XGBoost vs SVM",
    description: "Interactive notebook comparing model behavior across synthetic and tabular datasets.",
    stack: ["Python", "scikit-learn", "XGBoost", "Matplotlib"],
    colabUrl: "https://colab.research.google.com/",
  },
  {
    title: "Experiment Tracking and Metrics Log",
    description: "Reusable evaluation template for accuracy, F1, confidence intervals, and error slices.",
    stack: ["Python", "Pandas", "Seaborn", "MLflow"],
    colabUrl: "https://colab.research.google.com/",
  },
];

function statusClasses(status: ExperimentStatus) {
  if (status === "Completed") {
    return "border-emerald-300/40 bg-emerald-400/15 text-emerald-100";
  }
  if (status === "In Progress") {
    return "border-amber-300/40 bg-amber-400/15 text-amber-100";
  }
  return "border-slate-300/35 bg-slate-300/10 text-slate-200";
}

export function LabPageClient() {
  const [statusFilter, setStatusFilter] = useState<"All" | ExperimentStatus>("All");
  const [tableQuery, setTableQuery] = useState("");
  const filteredExperiments = useMemo(() => {
    const needle = tableQuery.trim().toLowerCase();
    return experimentRows.filter((row) => {
      const statusPass = statusFilter === "All" ? true : row.status === statusFilter;
      const queryPass =
        !needle ||
        row.model.toLowerCase().includes(needle) ||
        row.dataset.toLowerCase().includes(needle) ||
        row.notes.toLowerCase().includes(needle);
      return statusPass && queryPass;
    });
  }, [statusFilter, tableQuery]);

  const avgAccuracy = useMemo(() => {
    const values = experimentRows
      .map((row) => Number.parseFloat(row.accuracy.replace("%", "")))
      .filter((value) => Number.isFinite(value));

    if (!values.length) {
      return "0.0";
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return average.toFixed(1);
  }, []);

  const statusCounts = useMemo(() => {
    return experimentRows.reduce(
      (acc, row) => {
        acc[row.status] += 1;
        return acc;
      },
      { Completed: 0, "In Progress": 0, Planned: 0 } as Record<ExperimentStatus, number>,
    );
  }, []);

  const featuredNotebook = notebooks[0];
  const secondaryNotebooks = notebooks.slice(1);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/65 bg-[linear-gradient(132deg,hsl(var(--background)/0.98)_0%,hsl(var(--surface)/0.94)_56%,hsl(var(--surface-2)/0.9)_100%)] p-5 pb-[120px] sm:p-6 md:space-y-10 md:p-8 md:pb-[120px]">
      <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-[hsl(var(--accent-2)/0.12)] blur-3xl" aria-hidden="true" />

      <div className="relative space-y-8 md:space-y-10">
      <header className="lab-reveal lab-reveal-1 space-y-6 border-b border-cyan-300/20 pb-8">
        <div className="lab-eyebrow-wrap">
          <p className="lab-eyebrow text-xs uppercase tracking-[0.24em]">Interactive AI/ML Playground</p>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-cyan-50 md:text-5xl">Lab</h1>
        <p className="max-w-4xl text-sm leading-relaxed text-cyan-100/80 md:text-base">
          A live experimentation zone for testing models, visualizing behavior, and tracking hands-on AI research output.
        </p>
      </header>

      <section className="lab-reveal lab-reveal-2 mt-[80px] space-y-4">
        <div className="border-l-[3px] border-[#00d4ff] pl-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/45">01</p>
          <h2 className="text-[1.5rem] font-semibold tracking-tight text-cyan-50">Live Demos</h2>
        </div>
        <div className="grid gap-4">
          <article
            className="lab-box lab-float lab-demo-card relative rounded-2xl border border-cyan-300/25 bg-[#0d1b2a] p-4 md:p-5"
            style={{ "--box-index": 1 } as React.CSSProperties}
          >
            <div className="coming-ring" aria-hidden="true" />
            <div className="relative z-[1] flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-cyan-50">CNN Image Classifier</h3>
              <Badge className="border-amber-400/50 bg-amber-500/15 text-amber-200">
                Coming Soon
              </Badge>
            </div>
            <p className="mt-2 text-sm text-cyan-100/80">
              Upload any image - the model will classify it into 1000 categories with confidence scores. Built on EfficientNet fine-tuned on CIFAR-10.
            </p>
            <div className="mt-4 flex h-[200px] items-center justify-center rounded-xl border border-cyan-300/25 bg-[#0b1624] p-3">
              <svg viewBox="0 0 360 180" className="h-full w-full" role="img" aria-label="Animated neural network preview">
                <g fill="#d4f6ff" opacity="0.95">
                  <circle cx="35" cy="20" r="6" />
                  <circle cx="35" cy="55" r="6" />
                  <circle cx="35" cy="90" r="6" />
                  <circle cx="35" cy="125" r="6" />
                  <circle cx="35" cy="160" r="6" />
                </g>
                <g fill="#77e9ff" opacity="0.95">
                  <circle cx="170" cy="45" r="8" />
                  <circle cx="170" cy="90" r="8" />
                  <circle cx="170" cy="135" r="8" />
                </g>
                <g fill="#00d4ff">
                  <circle cx="320" cy="90" r="10" />
                </g>

                <g className="nn-links" stroke="#00d4ff" strokeWidth="1.7" fill="none" opacity="0.75">
                  <line x1="41" y1="20" x2="162" y2="45" />
                  <line x1="41" y1="20" x2="162" y2="90" />
                  <line x1="41" y1="20" x2="162" y2="135" />

                  <line x1="41" y1="55" x2="162" y2="45" />
                  <line x1="41" y1="55" x2="162" y2="90" />
                  <line x1="41" y1="55" x2="162" y2="135" />

                  <line x1="41" y1="90" x2="162" y2="45" />
                  <line x1="41" y1="90" x2="162" y2="90" />
                  <line x1="41" y1="90" x2="162" y2="135" />

                  <line x1="41" y1="125" x2="162" y2="45" />
                  <line x1="41" y1="125" x2="162" y2="90" />
                  <line x1="41" y1="125" x2="162" y2="135" />

                  <line x1="41" y1="160" x2="162" y2="45" />
                  <line x1="41" y1="160" x2="162" y2="90" />
                  <line x1="41" y1="160" x2="162" y2="135" />

                  <line x1="178" y1="45" x2="310" y2="90" />
                  <line x1="178" y1="90" x2="310" y2="90" />
                  <line x1="178" y1="135" x2="310" y2="90" />
                </g>
              </svg>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-cyan-100/80">
                <span className="text-cyan-300">Expected launch:</span> Q3 2026
              </p>
              <Button
                asChild
                variant="outline"
                className="group relative overflow-hidden border-cyan-300/40 hover:border-cyan-300/55 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] focus-visible:shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_0_18px_rgba(56,189,248,0.35)] active:shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_0_22px_rgba(56,189,248,0.45)]"
              >
                <Link href="https://github.com/kabirajrana" target="_blank" rel="noopener noreferrer">
                  <span className="relative inline-block before:absolute before:-bottom-[3px] before:left-0 before:h-[3px] before:w-4 before:bg-accent/22 before:blur-[2px] before:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:h-[1px] after:w-3 after:bg-accent after:content-[''] after:transition-[width] after:duration-500 after:ease-out before:transition-[width] before:duration-500 before:ease-out group-hover:after:w-full group-hover:before:w-full group-focus-visible:after:w-full group-focus-visible:before:w-full group-active:after:w-full group-active:before:w-full">
                    Watch on GitHub
                  </span>
                </Link>
              </Button>
            </div>
          </article>

        </div>
      </section>

      <section className="lab-reveal lab-reveal-3 mt-[80px] space-y-4">
        <div className="border-l-[3px] border-[#00d4ff] pl-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/45">02</p>
          <h2 className="text-[1.5rem] font-semibold tracking-tight text-cyan-50">Experiments Log</h2>
        </div>
        <div className="lab-box rounded-2xl border border-cyan-300/25 bg-surface/45 p-4 md:p-5" style={{ "--box-index": 5 } as React.CSSProperties}>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <article className="lab-box lab-float flex-1 rounded-[8px] border-[0.5px] border-cyan-300/25 bg-[#0d1b2a] px-4 py-3" style={{ "--box-index": 2 } as React.CSSProperties}>
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-cyan-200/55">
                <span aria-hidden="true" className="inline-flex">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.3L4.8 18A2 2 0 0 0 6.6 21h10.8a2 2 0 0 0 1.8-3L14 9.3V2" />
                    <path d="M8.5 2h7" />
                    <path d="M8 14h8" />
                  </svg>
                </span>
                Experiments
              </p>
              <p className="mt-1.5 text-lg font-semibold text-cyan-100">
                <span className="text-[#00d4ff]">{experimentRows.length}</span> Total Experiments
              </p>
            </article>

            <article className="lab-box lab-float flex-1 rounded-[8px] border-[0.5px] border-cyan-300/25 bg-[#0d1b2a] px-4 py-3" style={{ "--box-index": 3 } as React.CSSProperties}>
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-cyan-200/55">
                <span aria-hidden="true" className="inline-flex">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m7 14 4-4 3 3 6-6" />
                  </svg>
                </span>
                Performance
              </p>
              <p className="mt-1.5 text-lg font-semibold text-cyan-100">
                Avg Accuracy: <span className="text-[#00d4ff]">{avgAccuracy}%</span>
              </p>
            </article>

            <article className="lab-box lab-float flex-1 rounded-[8px] border-[0.5px] border-cyan-300/25 bg-[#0d1b2a] px-4 py-3" style={{ "--box-index": 4 } as React.CSSProperties}>
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-cyan-200/55">
                <span aria-hidden="true" className="inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                Status Mix
              </p>
              <p className="mt-1.5 text-lg font-semibold text-cyan-100">
                <span className="text-[#00d4ff]">{statusCounts["Completed"]}</span> Completed · <span className="text-[#00d4ff]">{statusCounts["In Progress"]}</span> In Progress · <span className="text-[#00d4ff]">{statusCounts["Planned"]}</span> Planned
              </p>
            </article>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={tableQuery}
              onChange={(event) => setTableQuery(event.target.value)}
              placeholder="Filter by model, dataset, or notes"
              className="w-full rounded-xl border border-cyan-300/25 bg-[#0d152a] px-3 py-2 text-sm text-cyan-100 placeholder:text-cyan-200/40"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "All" | ExperimentStatus)}
              className="rounded-xl border border-cyan-300/25 bg-[#0d152a] px-3 py-2 text-sm text-cyan-100"
            >
              <option>All</option>
              <option>Completed</option>
              <option>In Progress</option>
              <option>Planned</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cyan-300/20 text-cyan-200/90">
                  <th className="px-3 py-2 font-medium">Model</th>
                  <th className="px-3 py-2 font-medium">Dataset</th>
                  <th className="px-3 py-2 font-medium">Accuracy</th>
                  <th className="px-3 py-2 font-medium">F1 Score</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredExperiments.map((row) => (
                  <tr key={row.model} className="border-b border-cyan-300/10 text-cyan-100/90 hover:bg-[rgba(0,212,255,0.04)]">
                    <td className="px-3 py-3">{row.model}</td>
                    <td className="px-3 py-3">{row.dataset}</td>
                    <td className="px-3 py-3">
                      <span className="accuracy-cell" style={{ "--accuracy": row.accuracy } as React.CSSProperties}>
                        {row.accuracy}
                      </span>
                    </td>
                    <td className="px-3 py-3">{row.f1}</td>
                    <td className="px-3 py-3">{row.date}</td>
                    <td className="px-3 py-3">{row.notes}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium leading-none ${statusClasses(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="lab-reveal lab-reveal-4 mt-[80px] space-y-4">
        <div className="border-l-[3px] border-[#00d4ff] pl-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/45">03</p>
          <h2 className="text-[1.5rem] font-semibold tracking-tight text-cyan-50">Notebooks</h2>
        </div>
        <div className="space-y-4">
          <article
            className="lab-box lab-float rounded-2xl border border-[rgba(0,212,255,0.3)] bg-[linear-gradient(135deg,#0d1b2a_0%,#0a1628_100%)] p-6 md:p-7"
            style={{ "--box-index": 6 } as React.CSSProperties}
          >
            <h3 className="text-[1.1rem] font-semibold text-cyan-50">{featuredNotebook.title}</h3>
            <p className="mt-2 max-w-5xl text-sm leading-relaxed text-cyan-100/80 md:text-base">{featuredNotebook.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredNotebook.stack.map((item) => (
                <Badge key={`${featuredNotebook.title}-${item}`} className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
                  {item}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-cyan-200/55">Updated: March 2026</p>
            <div className="mt-5">
              <Button
                asChild
                variant="outline"
                className="group relative overflow-hidden border-cyan-300/40 hover:border-cyan-300/55 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] focus-visible:shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_0_18px_rgba(56,189,248,0.35)] active:shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_0_22px_rgba(56,189,248,0.45)]"
              >
                <Link href={featuredNotebook.colabUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4 12 4.8-4.8" />
                    <path d="m8.8 16.8 8.4-8.4" />
                    <path d="M14 20h6" />
                    <path d="m18 4 2 2" />
                  </svg>
                  <span className="relative inline-block before:absolute before:-bottom-[3px] before:left-0 before:h-[3px] before:w-4 before:bg-accent/22 before:blur-[2px] before:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:h-[1px] after:w-3 after:bg-accent after:content-[''] after:transition-[width] after:duration-500 after:ease-out before:transition-[width] before:duration-500 before:ease-out group-hover:after:w-full group-hover:before:w-full group-focus-visible:after:w-full group-focus-visible:before:w-full group-active:after:w-full group-active:before:w-full">
                    Open in Colab
                  </span>
                </Link>
              </Button>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            {secondaryNotebooks.map((notebook, index) => (
              <article
                key={notebook.title}
                className="lab-box lab-float rounded-2xl border border-cyan-300/25 bg-surface/45 p-4 md:p-5"
                style={{ "--box-index": index + 7 } as React.CSSProperties}
              >
                <h3 className="text-lg font-semibold text-cyan-50">{notebook.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cyan-100/80">{notebook.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {notebook.stack.map((item) => (
                    <Badge key={`${notebook.title}-${item}`} className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
                      {item}
                    </Badge>
                  ))}
                </div>
                <div className="mt-5">
                  <Button
                    asChild
                    variant="outline"
                    className="group relative overflow-hidden border-cyan-300/40 hover:border-cyan-300/55 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] focus-visible:shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_0_18px_rgba(56,189,248,0.35)] active:shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_0_22px_rgba(56,189,248,0.45)]"
                  >
                    <Link href={notebook.colabUrl} target="_blank" rel="noopener noreferrer">
                      <span className="relative inline-block before:absolute before:-bottom-[3px] before:left-0 before:h-[3px] before:w-4 before:bg-accent/22 before:blur-[2px] before:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:h-[1px] after:w-3 after:bg-accent after:content-[''] after:transition-[width] after:duration-500 after:ease-out before:transition-[width] before:duration-500 before:ease-out group-hover:after:w-full group-hover:before:w-full group-focus-visible:after:w-full group-focus-visible:before:w-full group-active:after:w-full group-active:before:w-full">
                        Open in Colab
                      </span>
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .lab-eyebrow-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0.35rem 0.75rem;
          overflow: hidden;
        }

        .lab-eyebrow-wrap::before {
          content: "";
          position: absolute;
          inset: -40%;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.06) 35%, transparent 70%);
          filter: blur(18px);
          animation: eyebrowGlow 4s ease-in-out infinite;
          pointer-events: none;
        }

        .lab-eyebrow {
          position: relative;
          color: #00d4ff;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.25);
        }

        .lab-demo-card {
          position: relative;
          overflow: hidden;
        }

        .lab-demo-card:hover {
          border-color: inherit;
          box-shadow: none;
        }

        .lab-box,
        .lab-float,
        .lab-reveal,
        .lab-reveal-1,
        .lab-reveal-2,
        .lab-reveal-3,
        .lab-reveal-4 {
          opacity: 1;
          transform: none;
          animation: none;
          transition: none;
          will-change: auto;
        }

        .coming-ring {
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: conic-gradient(from 0deg, rgba(0, 212, 255, 0.02), rgba(0, 212, 255, 0.12), rgba(0, 212, 255, 0.02));
          animation: spinRing 7s linear infinite;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .nn-links line {
          stroke-dasharray: 10;
          animation: flowDash 1.9s linear infinite;
        }

        @keyframes eyebrowGlow {
          0%,
          100% {
            transform: translateX(-8%) scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: translateX(8%) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes spinRing {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes flowDash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -20;
          }
        }

        .accuracy-cell {
          position: relative;
          display: inline-flex;
          align-items: center;
          min-width: 4.6rem;
          border-radius: 0.5rem;
          padding: 0.15rem 0.45rem;
          isolation: isolate;
          overflow: hidden;
        }

        .accuracy-cell::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--accuracy);
          background: rgba(0, 212, 255, 0.18);
          z-index: -1;
        }
      `}</style>
      </div>
    </div>
  );
}
