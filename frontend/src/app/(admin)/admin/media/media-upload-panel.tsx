"use client";

import { useState, useTransition } from "react";
import { Copy, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { createMediaAction } from "@/app/(admin)/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Button } from "@/components/ui/button";
import { uploadAsset, type UploadedAsset } from "@/lib/upload/upload-client";

export function MediaUploadPanel() {
  const [asset, setAsset] = useState<UploadedAsset | null>(null);
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState("");
  const [usedBy, setUsedBy] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const onFileSelect = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const uploaded = await uploadAsset(file, setProgress);
      setAsset(uploaded);
      toast.success("Asset uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveAsset = () => {
    if (!asset) {
      toast.error("Upload an asset first");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("key", asset.key);
      formData.set("url", asset.url);
      formData.set("type", asset.type);
      formData.set("size", String(asset.size));
      formData.set("width", String(asset.width ?? 0));
      formData.set("height", String(asset.height ?? 0));
      formData.set("tags", tags);
      formData.set("usedBy", usedBy);

      await createMediaAction(formData);
      toast.success("Asset saved to library");
      setAsset(null);
      setProgress(0);
      setTags("");
      setUsedBy("");
    });
  };

  return (
    <div className="space-y-3">
      <MediaUploader onFileSelect={onFileSelect} />

      {uploading ? (
        <div className="rounded-xl border border-border/70 bg-surface p-3">
          <p className="mb-2 text-sm text-muted">Uploading... {progress}%</p>
          <div className="h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {asset ? (
        <div className="space-y-2 rounded-xl border border-border/70 bg-surface p-3">
          <p className="text-sm font-medium">Uploaded asset ready</p>
          <div className="grid gap-2 md:grid-cols-2">
            <input value={asset.key} readOnly className="rounded-xl border border-border bg-surface-2 p-2 text-sm" />
            <div className="flex gap-2">
              <input value={asset.url} readOnly className="w-full rounded-xl border border-border bg-surface-2 p-2 text-sm" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(asset.url);
                  toast.success("URL copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="tags, comma, separated" className="rounded-xl border border-border bg-surface p-2" />
            <input value={usedBy} onChange={(event) => setUsedBy(event.target.value)} placeholder="used by refs" className="rounded-xl border border-border bg-surface p-2" />
          </div>

          <Button type="button" onClick={saveAsset} disabled={pending}>
            {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save to Library
          </Button>
        </div>
      ) : null}
    </div>
  );
}
