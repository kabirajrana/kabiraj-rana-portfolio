import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string | number;
  meta?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        {meta ? <p className="mt-1 text-xs text-muted">{meta}</p> : null}
      </CardContent>
    </Card>
  );
}
