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

  const sentence = split[0].trim();
  return sentence.endsWith(".") || sentence.endsWith("!") || sentence.endsWith("?") ? sentence : `${sentence}.`;
}

function getMetricResult(entry: PublicResearchEntry) {
  const content = entry.content;

  switch (entry.type) {
    case "EXPERIMENT":
      return toSingleSentence(
        "results" in content && typeof content.results === "string" ? content.results : "",
        "Controlled experiment outcomes are being finalized.",
      );
    case "PAPER":
      return toSingleSentence(
        "results" in content && typeof content.results === "string" ? content.results : "",
        "Primary publication outcomes are being summarized.",
      );
    case "SYSTEM":
      return toSingleSentence(
        "evaluation" in content && typeof content.evaluation === "string" ? content.evaluation : "",
        "System evaluation highlights are pending update.",
      );
    case "THESIS":
      return toSingleSentence(
        "findings" in content && typeof content.findings === "string" ? content.findings : "",
        "Current thesis findings are under review.",
      );
    case "NOTE":
      return toSingleSentence(
        "implications" in content && typeof content.implications === "string" ? content.implications : "",
        "Key implications are being refined.",
      );
    default:
      return "Key results are being updated.";
  }
}

function getDisplayStatus(entry: PublicResearchEntry): { label: string; className: string } {
  if (entry.type === "THESIS") {
    return {
      label: "IN PROGRESS",
      className: "border-amber-300/45 bg-amber-400/15 text-amber-100",
    };
  }

  if (entry.type === "EXPERIMENT" && entry.status === "PUBLISHED") {
    return {
      label: "TECHNICAL NOTE",
      className: "border-slate-300/35 bg-slate-300/10 text-slate-200",
    };
  }

  return {
    label: entry.status,
    className: "",
  };
}

function getTypeBadgeClass(type: PublicResearchEntry["type"]) {
  if (type === "EXPERIMENT") return "border-cyan-300/45 bg-cyan-400/15 text-cyan-100";
  if (type === "THESIS") return "border-amber-300/45 bg-amber-400/15 text-amber-100";
  if (type === "PAPER") return "border-violet-300/45 bg-violet-400/15 text-violet-100";
  if (type === "NOTE") return "border-slate-300/35 bg-slate-300/10 text-slate-200";
  return "border-cyan-300/35 bg-cyan-400/12 text-cyan-100";
}

export function ResearchFeaturedItem({ entry }: { entry: PublicResearchEntry }) {
  const summary = toSingleSentence(entry.summary, "Research summary will be published shortly.");
  const metric = getMetricResult(entry);
  const displayStatus = getDisplayStatus(entry);
  const tags = entry.slug === "random-forest-vs-xgboost-performance-study" ? entry.tags.slice(0, 3) : entry.tags;

  return (
    <article className="rounded-2xl border border-border/60 bg-surface/40 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={displayStatus.className}>{displayStatus.label}</Badge>
        <Badge className={getTypeBadgeClass(entry.type)}>{getTypeLabel(entry.type).toUpperCase()}</Badge>
        <Badge>{entry.year}</Badge>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{entry.title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{summary}</p>
      <p className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-400/5 px-3 py-2 text-sm text-cyan-100/90">
        <span className="font-medium text-cyan-200">Key metric/result:</span> {metric}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={`${entry.id}-${tag}`} className="border border-border/65 bg-transparent text-muted">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span>{entry.authors.join(", ") || "Independent Research"}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {entry.pdfUrl ? (
          <Button asChild variant="outline">
            <Link href={entry.pdfUrl} target="_blank" rel="noopener noreferrer">
              PDF
            </Link>
          </Button>
        ) : null}
        {entry.codeUrl ? (
          <Button asChild variant="outline">
            <Link href={entry.codeUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
          </Button>
        ) : null}
        <Button
          asChild
          variant="outline"
          className="group relative overflow-hidden border-cyan-300/40 hover:border-cyan-300/55 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] focus-visible:shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_0_18px_rgba(56,189,248,0.35)] active:shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_0_22px_rgba(56,189,248,0.45)]"
        >
          <Link href={`/research/${entry.slug}`}>
            <span className="relative inline-block before:absolute before:-bottom-[3px] before:left-0 before:h-[3px] before:w-4 before:bg-accent/22 before:blur-[2px] before:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:h-[1px] after:w-3 after:bg-accent after:content-[''] after:transition-[width] after:duration-500 after:ease-out before:transition-[width] before:duration-500 before:ease-out group-hover:after:w-full group-hover:before:w-full group-focus-visible:after:w-full group-focus-visible:before:w-full group-active:after:w-full group-active:before:w-full">
              View Research
            </span>
          </Link>
        </Button>
      </div>
    </article>
  );
}
