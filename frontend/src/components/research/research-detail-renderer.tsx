export type TocItem = { id: string; title: string; level: number };

const DEFAULT_TOC: TocItem[] = [
  { id: "overview", title: "Overview", level: 1 },
  { id: "details", title: "Details", level: 1 },
  { id: "summary", title: "Summary", level: 1 },
];

export function getTocByType(_type: any): TocItem[] {
  return DEFAULT_TOC;
}

export function ResearchDetailRenderer({
  content,
}: {
  type?: any;
  content?: any;
}) {
  return (
    <div className="prose max-w-none">
      {content ? <div>{JSON.stringify(content)}</div> : <p>No content.</p>}
    </div>
  );
}
