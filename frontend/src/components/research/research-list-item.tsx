import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTypeLabel } from "@/lib/research/types";
import type { PublicResearchEntry } from "@/types/research";

export function ResearchListItem({ entry }: { entry: PublicResearchEntry }) {
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
        <p className="max-w-4xl text-sm leading-relaxed text-muted">{entry.summary}</p>
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
      <div>
        <Button asChild variant="outline">
          <Link href={`/research/${entry.slug}`}>View Research</Link>
        </Button>
      </div>
    </article>
  );
}
