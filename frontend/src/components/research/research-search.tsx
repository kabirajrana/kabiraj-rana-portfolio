export function ResearchSearch({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <input
        type="search"
        placeholder="Search research..."
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
