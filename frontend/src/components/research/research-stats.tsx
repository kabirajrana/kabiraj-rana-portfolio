type ResearchStatsProps = {
  total: number;
  publications: number;
  experiments: number;
  systems: number;
  notes: number;
  thesis: number;
};

const items: { key: keyof ResearchStatsProps; label: string }[] = [
  { key: "total", label: "Total Publications" },
  { key: "experiments", label: "Total Experiments" },
  { key: "systems", label: "Total Systems" },
  { key: "notes", label: "Total Notes" },
  { key: "thesis", label: "Total Thesis Works" },
  { key: "publications", label: "Peer-style Publications" },
];

export function ResearchStats(props: ResearchStatsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.key} className="rounded-xl border border-border/60 bg-surface/35 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{props[item.key]}</p>
        </article>
      ))}
    </section>
  );
}
