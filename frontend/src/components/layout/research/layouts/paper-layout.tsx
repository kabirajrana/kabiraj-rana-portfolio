import type { PaperContent } from "@/lib/research/types";

import { ResearchSections, type Section } from "@/components/research/layouts/shared";

export function PaperLayout({ content }: { content: PaperContent }) {
  const sections: Section[] = [
    { id: "abstract", title: "Abstract", content: content.abstract },
    { id: "introduction", title: "Introduction", content: content.introduction },
    { id: "problem-statement", title: "Problem Statement", content: content.problemStatement },
    { id: "related-work", title: "Related Work", content: content.relatedWork },
    { id: "methodology", title: "Methodology", content: content.methodology },
    { id: "system-architecture", title: "System Architecture", content: content.systemArchitecture },
    { id: "experiments", title: "Experiments", content: content.experiments },
    { id: "results", title: "Results", content: content.results },
    { id: "discussion", title: "Discussion", content: content.discussion },
    { id: "conclusion", title: "Conclusion", content: content.conclusion },
    { id: "future-work", title: "Future Work", content: content.futureWork },
  ];

  return <ResearchSections sections={sections} />;
}
