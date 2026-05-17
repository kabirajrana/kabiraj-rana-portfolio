export function ResearchFeaturedItem({ item }: { item?: any }) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">{item?.title ?? "Featured Research"}</h2>
      <p className="mt-2 text-muted-foreground">{item?.summary ?? ""}</p>
    </div>
  );
}
