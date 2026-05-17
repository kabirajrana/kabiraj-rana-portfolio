import type { ReactNode } from "react";

export type Section = { id: string; title: string; content?: string | null };

function renderBlock(content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return <p className="text-sm text-muted">Content pending update.</p>;
  }

  if (trimmed.startsWith("graph ") || trimmed.startsWith("flowchart") || trimmed.startsWith("sequenceDiagram")) {
    return <pre className="overflow-auto rounded-xl border border-border/50 bg-surface/30 p-4 text-xs leading-relaxed">{trimmed}</pre>;
  }

  return <p className="whitespace-pre-wrap leading-relaxed text-text/95">{trimmed}</p>;
}

export function ResearchSections({ sections, footer }: { sections: Section[]; footer?: ReactNode }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section id={section.id} key={section.id} className="scroll-mt-24 space-y-3 border-b border-border/40 pb-8">
          <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
          {renderBlock(section.content ?? "")}
        </section>
      ))}
      {footer ? <div>{footer}</div> : null}
    </div>
  );
}
