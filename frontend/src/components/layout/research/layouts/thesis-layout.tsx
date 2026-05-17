import type { ThesisContent } from "@/lib/research/types";

import { ResearchSections, type Section } from "@/components/research/layouts/shared";

export function ThesisLayout({ content }: { content: ThesisContent }) {
  const sections: Section[] = [
    { id: "abstract", title: "Abstract", content: content.abstract },
    { id: "context", title: "Context", content: content.context },
    { id: "research-question", title: "Research Question", content: content.researchQuestion },
    { id: "literature-review", title: "Literature Review", content: content.literatureReview },
    { id: "methodology", title: "Methodology", content: content.methodology },
    { id: "implementation", title: "Implementation", content: content.implementation },
    { id: "findings", title: "Findings", content: content.findings },
    { id: "discussion", title: "Discussion", content: content.discussion },
    { id: "conclusion", title: "Conclusion", content: content.conclusion },
    { id: "limitations", title: "Limitations", content: content.limitations },
    { id: "future-work", title: "Future Work", content: content.futureWork },
    { id: "appendix", title: "Appendix", content: content.appendix },
  ];

  return <ResearchSections sections={sections} />;
}
