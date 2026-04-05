import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTypeLabel } from "@/lib/research/types";
import type { PublicResearchEntry } from "@/types/research";

function toSingleSentence(text: string, fallback: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }

  const split = cleaned.match(/^[^.!?]+[.!?]?/);
  if (!split) {
    return cleaned;
  }

  const first = split[0].trim();
  return first.endsWith(".") || first.endsWith("!") || first.endsWith("?") ? first : `${first}.`;
}

function getMetricResult(entry: PublicResearchEntry) {
  if (entry.slug === "cnn-vs-transfer-learning-for-image-recognition") {
    return "91.4%";
  }
  if (entry.slug === "random-forest-vs-xgboost-performance-study") {
    return "87.6%";
  }
  if (entry.slug === "logistic-regression-vs-svm-on-classification-tasks") {
    return "82.1%";
  }

  const content = entry.content;

  switch (entry.type) {
    case "EXPERIMENT":
      return toSingleSentence(
        "metrics" in content && typeof content.metrics === "string"
          ? content.metrics
          : "results" in content && typeof content.results === "string"
            ? content.results
            : "",
        "Controlled experiments are currently being documented.",
      );
    case "PAPER":
      return toSingleSentence(
        "results" in content && typeof content.results === "string" ? content.results : "",
        "Primary paper results are being consolidated.",
      );
    case "SYSTEM":
      return toSingleSentence(
        "evaluation" in content && typeof content.evaluation === "string" ? content.evaluation : "",
        "System evaluation metrics will be added soon.",
      );
    case "THESIS":
      return "In Progress";
    case "NOTE":
      return toSingleSentence(
        "implications" in content && typeof content.implications === "string" ? content.implications : "",
        "Practical implications are being refined.",
      );
    default:
      return "Key results are being updated.";
  }
}

function getTrackBadgeClass(type: PublicResearchEntry["type"]) {
  if (type === "EXPERIMENT") return "border-cyan-300/40 bg-cyan-400/14 text-cyan-100";
  if (type === "THESIS") return "border-amber-300/45 bg-amber-400/12 text-amber-100";
  if (type === "PAPER") return "border-violet-300/40 bg-violet-400/12 text-violet-100";
  if (type === "NOTE") return "border-slate-300/35 bg-slate-300/10 text-slate-200";
  return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
}

function getThesisProgress(entry: PublicResearchEntry): number | null {
  if (entry.type !== "THESIS") {
    return null;
  }

  if (typeof entry.progressPercent === "number" && Number.isFinite(entry.progressPercent)) {
    return Math.max(0, Math.min(100, Math.round(entry.progressPercent)));
  }

  const findings = "findings" in entry.content && typeof entry.content.findings === "string" ? entry.content.findings : "";
  const matched = findings.match(/(\d{1,3})\s*%/);
  if (!matched) {
    return null;
  }

  const value = Number.parseInt(matched[1] ?? "", 10);
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
}

export function ResearchListItem({ entry }: { entry: PublicResearchEntry }) {
  const summary = toSingleSentence(entry.summary, "Research summary will be published shortly.");
  const metric = getMetricResult(entry);
  const progress = getThesisProgress(entry);

  return (
    <article className="rounded-xl border border-border/70 bg-surface/35 p-4 transition-colors duration-300 hover:border-[rgba(0,212,255,0.4)] md:p-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getTrackBadgeClass(entry.type)}>{entry.type}</Badge>
            <Badge className="border border-border/70 bg-background/50 text-muted">{entry.year}</Badge>
          </div>
          {entry.status ? <Badge className="border border-border/70 bg-background/40 text-muted">{entry.status}</Badge> : null}
        </div>

        <h3 className="text-xl font-medium tracking-tight">{entry.title}</h3>

        <p
          className="max-w-4xl text-sm leading-relaxed text-muted"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {summary}
        </p>

        <p
          className="inline-flex rounded-full border border-cyan-300/28 bg-cyan-400/8 text-xs font-medium text-cyan-100 whitespace-nowrap overflow-visible min-w-fit"
          style={{ padding: "2px 10px" }}
        >
          {metric}
        </p>

        {progress !== null ? (
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-amber-200/85">Progress {progress}%</p>
            <div className="h-2 w-full overflow-hidden rounded-full border border-amber-300/25 bg-amber-400/10">
              <div className="h-full rounded-full bg-amber-300/70" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <Badge key={`${entry.id}-${tag}`} className="border border-border/65 bg-transparent text-muted">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted">
          {entry.authors.join(", ") || "Independent Research"}
        </p>

        <Button
          asChild
          variant="outline"
          className="group relative mt-1 overflow-hidden border-cyan-300/40 hover:border-cyan-300/55"
        >
          <Link href={`/research/${entry.slug}`}>
            <span className="relative inline-block after:absolute after:-bottom-[1px] after:left-0 after:h-[1px] after:w-3 after:bg-accent after:content-[''] after:transition-[width] after:duration-300 after:ease-out group-hover:after:w-full group-focus-visible:after:w-full group-active:after:w-full">
              View Details
            </span>
          </Link>
        </Button>
      </div>
    </article>
  );
}
