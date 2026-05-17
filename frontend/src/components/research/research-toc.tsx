import type { TocItem } from "./research-detail-renderer";

export function ResearchToc({ items }: { items?: TocItem[] }) {
  if (!items?.length) return null;

  return (
    <nav className="space-y-1 text-sm">
      <p className="font-medium mb-2">On this page</p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="block text-muted-foreground hover:text-foreground"
          style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
