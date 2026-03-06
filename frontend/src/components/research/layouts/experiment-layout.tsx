import type { ExperimentContent } from "@/lib/research/types";

import { ResearchSections, type Section } from "@/components/research/layouts/shared";

export function ExperimentLayout({ content }: { content: ExperimentContent }) {
  const sections: Section[] = [
    { id: "objective", title: "Objective", content: content.objective },
    { id: "dataset", title: "Dataset", content: content.dataset },
    { id: "method", title: "Method", content: content.method },
    { id: "metrics", title: "Metrics", content: content.metrics },
    { id: "results", title: "Results", content: content.results },
    { id: "key-insight", title: "Key Insight", content: content.keyInsight },
    { id: "limitations", title: "Limitations", content: content.limitations },
    { id: "next-steps", title: "Next Steps", content: content.nextSteps },
  ];

  return <ResearchSections sections={sections} />;
}
