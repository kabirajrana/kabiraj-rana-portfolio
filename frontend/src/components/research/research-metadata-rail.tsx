export function ResearchMetadataRail({
  item,
  entry,
}: {
  item?: any;
  entry?: any;
}) {
  const data = entry ?? item;
  return (
    <aside className="space-y-4 text-sm text-muted-foreground">
      {data?.date && (
        <div>
          <p className="font-medium text-foreground">Published</p>
          <p>{data.date}</p>
        </div>
      )}
      {data?.track && (
        <div>
          <p className="font-medium text-foreground">Track</p>
          <p>{data.track}</p>
        </div>
      )}
    </aside>
  );
}
