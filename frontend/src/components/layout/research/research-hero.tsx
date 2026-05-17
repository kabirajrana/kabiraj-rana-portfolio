import { Badge } from "@/components/ui/badge";

export function ResearchHero() {
  return (
    <header className="space-y-6 border-b border-cyan-300/20 pb-10">
      <p className="text-xs uppercase tracking-[0.26em] text-cyan-300">Research Program</p>
      <div className="space-y-3">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-cyan-50 md:text-5xl">AI Research Lab</h1>
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Machine Learning Systems • Applied AI • Intelligent Infrastructure</p>
      </div>
      <p className="max-w-4xl text-base leading-relaxed text-muted md:text-lg">
        Research exploring scalable machine learning systems, model architectures, intelligent data pipelines, and applied AI systems for real-world impact.
        This archive documents publications, experiments, technical notes, thesis work, and system design research.
      </p>
      <p className="max-w-4xl text-sm leading-relaxed text-cyan-100/85 md:text-base">
        Active thesis: Explainability and Robustness in Deployed ML Systems - BSc Dissertation 2026.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge>ML Systems</Badge>
        <Badge>Model Architecture</Badge>
        <Badge>Data Infrastructure</Badge>
        <Badge>Applied AI</Badge>
        <Badge>Intelligent Automation</Badge>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="rounded-[10px] border border-[rgba(0,212,255,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-[10px]">
          <p className="text-[22px] font-semibold leading-none text-[#00d4ff]">4</p>
          <p className="mt-1 text-[10px] text-muted">Experiments</p>
        </article>
        <article className="rounded-[10px] border border-[rgba(0,212,255,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-[10px]">
          <p className="text-[22px] font-semibold leading-none text-[#00d4ff]">3</p>
          <p className="mt-1 text-[10px] text-muted">Technical Notes</p>
        </article>
        <article className="rounded-[10px] border border-[rgba(0,212,255,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-[10px]">
          <p className="text-[22px] font-semibold leading-none text-[#00d4ff]">1</p>
          <p className="mt-1 text-[10px] text-muted">Thesis Work</p>
        </article>
        <article className="rounded-[10px] border border-[rgba(0,212,255,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-[10px]">
          <p className="text-[22px] font-semibold leading-none text-[#00d4ff]">2026</p>
          <p className="mt-1 text-[10px] text-muted">Active Year</p>
        </article>
      </section>
    </header>
  );
}
