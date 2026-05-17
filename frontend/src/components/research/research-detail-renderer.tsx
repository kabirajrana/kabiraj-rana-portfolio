export type TocItem = { id: string; title: string; level: number };

export function getTocByType(content: any): TocItem[] {
  return [];
}

export function ResearchDetailRenderer({ content }: { content?: any }) {
  return (
    <div className="prose max-w-none">
      {content ? <div>{JSON.stringify(content)}</div> : <p>No content.</p>}
    </div>
  );
}
