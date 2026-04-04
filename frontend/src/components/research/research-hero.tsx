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
      <div className="flex flex-wrap gap-2">
        <Badge>ML Systems</Badge>
        <Badge>Model Architecture</Badge>
        <Badge>Data Infrastructure</Badge>
        <Badge>Applied AI</Badge>
        <Badge>Intelligent Automation</Badge>
      </div>
    </header>
  );
}
