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
  switch (entry.type) {
    case "EXPERIMENT":
      return toSingleSentence(entry.content.results, "Controlled experiments are currently being documented.");
    case "PAPER":
      return toSingleSentence(entry.content.results, "Primary paper results are being consolidated.");
    case "SYSTEM":
      return toSingleSentence(entry.content.evaluation, "System evaluation metrics will be added soon.");
    case "THESIS":
      return toSingleSentence(entry.content.findings, "Current thesis findings are under review.");
    case "NOTE":
      return toSingleSentence(entry.content.implications, "Practical implications are being refined.");
    default:
      return "Key results are being updated.";
  }
}

export function ResearchListItem({ entry }: { entry: PublicResearchEntry }) {
  const summary = toSingleSentence(entry.summary, "Research summary will be published shortly.");
  const metric = getMetricResult(entry);

  return (
    <article className="grid gap-4 border-b border-border/50 py-6 md:grid-cols-[1fr_auto] md:items-center">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{getTypeLabel(entry.type)}</Badge>
          <Badge>{entry.year}</Badge>
          <Badge>{entry.status}</Badge>
          {entry.researchArea ? <Badge>{entry.researchArea}</Badge> : null}
        </div>
        <h3 className="text-xl font-medium tracking-tight">{entry.title}</h3>
        <p className="max-w-4xl text-sm leading-relaxed text-muted">{summary}</p>
        <p className="rounded-lg border border-cyan-300/20 bg-cyan-400/5 px-3 py-2 text-sm text-cyan-100/90">
          <span className="font-medium text-cyan-200">Key metric/result:</span> {metric}
        </p>
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <Badge key={`${entry.id}-${tag}`}>{tag}</Badge>
          ))}
        </div>
        <p className="text-xs text-muted">
          {entry.authors.join(", ") || "Independent Research"}
          {entry.affiliation ? ` • ${entry.affiliation}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
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
