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
          <Button
            key={option}
            size="sm"
            variant="outline"
            onClick={() => onChange(option)}
            type="button"
            aria-pressed={active === option}
            className={
              active === option
                ? "border-cyan-300/55 bg-cyan-400/14 text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.22)]"
                : ""
            }
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
