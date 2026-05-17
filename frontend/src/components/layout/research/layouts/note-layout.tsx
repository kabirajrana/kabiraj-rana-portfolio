import type { NoteContent } from "@/lib/research/types";

import { ResearchSections, type Section } from "@/components/research/layouts/shared";

export function NoteLayout({ content }: { content: NoteContent }) {
  const sections: Section[] = [
    { id: "overview", title: "Overview", content: content.overview },
    { id: "key-idea", title: "Key Idea", content: content.keyIdea },
    { id: "explanation", title: "Explanation", content: content.explanation },
    { id: "implications", title: "Implications", content: content.implications },
    { id: "references", title: "References", content: content.references },
  ];

  return <ResearchSections sections={sections} />;
}
