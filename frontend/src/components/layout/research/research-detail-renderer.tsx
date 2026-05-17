import type { ExperimentContent, NoteContent, PaperContent, ResearchContent, ResearchType, SystemContent, ThesisContent } from "@/lib/research/types";

import { ExperimentLayout } from "@/components/research/layouts/experiment-layout";
import { NoteLayout } from "@/components/research/layouts/note-layout";
import { PaperLayout } from "@/components/research/layouts/paper-layout";
import { SystemLayout } from "@/components/research/layouts/system-layout";
import { ThesisLayout } from "@/components/research/layouts/thesis-layout";
import type { TocItem } from "@/components/research/research-toc";

const TOC_BY_TYPE: Record<ResearchType, TocItem[]> = {
  EXPERIMENT: [
    { id: "objective", label: "Objective" },
    { id: "dataset", label: "Dataset" },
    { id: "method", label: "Method" },
    { id: "metrics", label: "Metrics" },
    { id: "results", label: "Results" },
    { id: "key-insight", label: "Key Insight" },
    { id: "limitations", label: "Limitations" },
    { id: "next-steps", label: "Next Steps" },
  ],
  PAPER: [
    { id: "abstract", label: "Abstract" },
    { id: "introduction", label: "Introduction" },
    { id: "problem-statement", label: "Problem Statement" },
    { id: "related-work", label: "Related Work" },
    { id: "methodology", label: "Methodology" },
    { id: "system-architecture", label: "System Architecture" },
    { id: "experiments", label: "Experiments" },
    { id: "results", label: "Results" },
    { id: "discussion", label: "Discussion" },
    { id: "conclusion", label: "Conclusion" },
    { id: "future-work", label: "Future Work" },
  ],
  SYSTEM: [
    { id: "overview", label: "Overview" },
    { id: "problem", label: "Problem" },
    { id: "system-diagram", label: "System Diagram" },
    { id: "components", label: "Components" },
    { id: "data-flow", label: "Data Flow" },
    { id: "architecture-decisions", label: "Architecture Decisions" },
    { id: "tech-stack", label: "Tech Stack" },
    { id: "evaluation", label: "Evaluation" },
    { id: "conclusion", label: "Conclusion" },
  ],
  THESIS: [
    { id: "abstract", label: "Abstract" },
    { id: "context", label: "Context" },
    { id: "research-question", label: "Research Question" },
    { id: "literature-review", label: "Literature Review" },
    { id: "methodology", label: "Methodology" },
    { id: "implementation", label: "Implementation" },
    { id: "findings", label: "Findings" },
    { id: "discussion", label: "Discussion" },
    { id: "conclusion", label: "Conclusion" },
    { id: "limitations", label: "Limitations" },
    { id: "future-work", label: "Future Work" },
    { id: "appendix", label: "Appendix" },
  ],
  NOTE: [
    { id: "overview", label: "Overview" },
    { id: "key-idea", label: "Key Idea" },
    { id: "explanation", label: "Explanation" },
    { id: "implications", label: "Implications" },
    { id: "references", label: "References" },
  ],
};

export function getTocByType(type: ResearchType): TocItem[] {
  return TOC_BY_TYPE[type];
}

export function ResearchDetailRenderer({ type, content }: { type: ResearchType; content: ResearchContent }) {
  if (type === "EXPERIMENT") {
    return <ExperimentLayout content={content as ExperimentContent} />;
  }

  if (type === "PAPER") {
    return <PaperLayout content={content as PaperContent} />;
  }

  if (type === "SYSTEM") {
    return <SystemLayout content={content as SystemContent} />;
  }

  if (type === "THESIS") {
    return <ThesisLayout content={content as ThesisContent} />;
  }

  return <NoteLayout content={content as NoteContent} />;
}
