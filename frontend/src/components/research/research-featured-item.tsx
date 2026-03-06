import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTypeLabel } from "@/lib/research/types";
import type { PublicResearchEntry } from "@/types/research";

export function ResearchFeaturedItem({ entry }: { entry: PublicResearchEntry }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-surface/40 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">Featured</Badge>
        <Badge>{getTypeLabel(entry.type)}</Badge>
        <Badge>{entry.year}</Badge>
        <Badge>{entry.status}</Badge>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{entry.title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{entry.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span>{entry.authors.join(", ") || "Independent Research"}</span>
        {entry.affiliation ? <span>• {entry.affiliation}</span> : null}
        {entry.researchArea ? <span>• {entry.researchArea}</span> : null}
      </div>
      <div className="mt-6">
        <Button asChild>
          <Link href={`/research/${entry.slug}`}>View Research</Link>
        </Button>
      </div>
    </article>
  );
}
