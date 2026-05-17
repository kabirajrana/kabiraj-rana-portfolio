import type { SystemContent } from "@/lib/research/types";

import { ResearchSections, type Section } from "@/components/research/layouts/shared";

export function SystemLayout({ content }: { content: SystemContent }) {
  const sections: Section[] = [
    { id: "overview", title: "Overview", content: content.overview },
    { id: "problem", title: "Problem", content: content.problem },
    { id: "system-diagram", title: "System Diagram", content: content.systemDiagram },
    { id: "components", title: "Components", content: content.components },
    { id: "data-flow", title: "Data Flow", content: content.dataFlow },
    { id: "architecture-decisions", title: "Architecture Decisions", content: content.architectureDecisions },
    { id: "tech-stack", title: "Tech Stack", content: content.techStack },
    { id: "evaluation", title: "Evaluation", content: content.evaluation },
    { id: "conclusion", title: "Conclusion", content: content.conclusion },
  ];

  return <ResearchSections sections={sections} />;
}
