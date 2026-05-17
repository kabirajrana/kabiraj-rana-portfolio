export function ResearchFilters({
  tracks = [],
  selected,
  onSelect,
}: {
  tracks?: string[];
  selected?: string;
  onSelect?: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tracks.map((t) => (
        <button
          key={t}
          onClick={() => onSelect?.(t)}
          className={`rounded-full px-4 py-1 text-sm border ${
            selected === t
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
