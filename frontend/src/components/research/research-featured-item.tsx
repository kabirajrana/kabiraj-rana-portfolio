export function ResearchFeaturedItem({
  item,
  entry,
}: {
  item?: any;
  entry?: any;
}) {
  const data = entry ?? item;
  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">{data?.title ?? "Featured Research"}</h2>
      <p className="mt-2 text-muted-foreground">{data?.summary ?? ""}</p>
    </div>
  );
}
