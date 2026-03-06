"use client";

import { UploadCloud } from "lucide-react";

export function MediaUploader({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-surface/40 px-4 py-6 text-sm text-muted hover:border-accent/40 hover:text-text">
      <UploadCloud className="h-4 w-4" />
      Drag & drop or click to upload
      <input
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelect(file);
          }
        }}
      />
    </label>
  );
}
