import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-accent">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
