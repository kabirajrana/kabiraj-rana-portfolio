export function ResearchMetadataRail({ item }: { item?: any }) {
  return (
    <aside className="space-y-4 text-sm text-muted-foreground">
      {item?.date && (
        <div>
          <p className="font-medium text-foreground">Published</p>
          <p>{item.date}</p>
        </div>
      )}
      {item?.track && (
        <div>
          <p className="font-medium text-foreground">Track</p>
          <p>{item.track}</p>
        </div>
      )}
    </aside>
  );
}
