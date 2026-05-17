import { Input } from "@/components/ui/input";

export function ResearchSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Search Archive</p>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search by title or summary" />
    </div>
  );
}
