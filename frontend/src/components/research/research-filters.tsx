import { Button } from "@/components/ui/button";

export function ResearchFilters({
  label,
  options,
  active,
  onChange,
}: {
  label: string;
  options: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button key={option} size="sm" variant={active === option ? "default" : "outline"} onClick={() => onChange(option)} type="button">
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
