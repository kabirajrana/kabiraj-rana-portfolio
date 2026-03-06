"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <a href="/api/admin/backup" target="_blank" rel="noreferrer">
        <Button type="button" variant="outline">Export JSON Backup</Button>
      </a>

      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" />
      <Button
        type="button"
        disabled={pending}
        onClick={() => {
          const file = fileInputRef.current?.files?.[0];
          if (!file) {
            toast.error("Choose a JSON backup file first");
            return;
          }

          startTransition(async () => {
            const text = await file.text();
            const dryRunResponse = await fetch("/api/admin/backup?dryRun=1", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: text,
            });
            if (!dryRunResponse.ok) {
              toast.error("Import failed");
              return;
            }

            const dryRunPayload = (await dryRunResponse.json()) as {
              counts?: Record<string, number>;
              warnings?: string[];
            };

            const proceed = window.confirm(
              `Dry run successful. Import counts: ${JSON.stringify(dryRunPayload.counts ?? {})}${
                dryRunPayload.warnings?.length ? `\nWarnings: ${dryRunPayload.warnings.join(", ")}` : ""
              }\n\nProceed with import?`,
            );

            if (!proceed) {
              return;
            }

            const response = await fetch("/api/admin/backup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: text,
            });

            if (!response.ok) {
              toast.error("Import apply failed");
              return;
            }

            toast.success("Backup imported successfully");
          });
        }}
      >
        Dry-Run + Import JSON
      </Button>
    </div>
  );
}
