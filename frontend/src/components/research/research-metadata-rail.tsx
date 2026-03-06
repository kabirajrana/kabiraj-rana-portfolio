import { Badge } from "@/components/ui/badge";
import type { PublicResearchEntry } from "@/types/research";

function OptionalLink({ href, label }: { href?: string | null; label: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-sm text-accent underline-offset-4 hover:underline">
      {label}
    </a>
  );
}

export function ResearchMetadataRail({ entry }: { entry: PublicResearchEntry }) {
  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] space-y-5 overflow-auto border-r border-border/50 pr-4 lg:block">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Metadata</p>
        <Badge>{entry.type}</Badge>
        <Badge>{entry.year}</Badge>
        <Badge>{entry.status}</Badge>
        {entry.researchArea ? <Badge>{entry.researchArea}</Badge> : null}
      </div>
      <div className="space-y-1 text-sm text-muted">
        {entry.dataset ? <p>Dataset: {entry.dataset}</p> : null}
        {entry.duration ? <p>Duration: {entry.duration}</p> : null}
        <p>Updated: {new Date(entry.updatedAt).toLocaleDateString()}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Links</p>
        <div className="space-y-1">
          <OptionalLink href={entry.pdfUrl} label="PDF" />
          <OptionalLink href={entry.codeUrl} label="Code" />
          <OptionalLink href={entry.demoUrl} label="Demo" />
          <OptionalLink href={entry.notesUrl} label="Notes" />
        </div>
      </div>
      {entry.citation ? (
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Citation</p>
          <pre className="whitespace-pre-wrap rounded-xl border border-border/50 bg-surface/30 p-3 text-xs leading-relaxed">{entry.citation}</pre>
        </div>
      ) : null}
    </aside>
  );
}
