"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { createResumeAction } from "@/app/(admin)/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Button } from "@/components/ui/button";
import { uploadAsset, type UploadedAsset } from "@/lib/upload/upload-client";

export function ResumeUploadPanel() {
  const [asset, setAsset] = useState<UploadedAsset | null>(null);
  const [label, setLabel] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const onFileSelect = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploaded = await uploadAsset(file, setProgress);
      setAsset(uploaded);
      if (!label) {
        setLabel(new Date().toISOString().slice(0, 10));
      }
      toast.success("Resume uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveResume = () => {
    if (!asset) {
      toast.error("Upload a resume first");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("label", label || "Resume");
      formData.set("url", asset.url);
      if (isActive) {
        formData.set("isActive", "on");
      }

      await createResumeAction(formData);
      toast.success("Resume version saved");
      setAsset(null);
      setProgress(0);
      setLabel("");
      setIsActive(true);
    });
  };

  return (
    <div className="space-y-3">
      <MediaUploader onFileSelect={onFileSelect} />

      {uploading ? (
        <div className="rounded-xl border border-border/70 bg-surface p-3">
          <p className="mb-2 text-sm text-muted">Uploading PDF... {progress}%</p>
          <div className="h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {asset ? (
        <div className="grid gap-2 rounded-xl border border-border/70 bg-surface p-3 md:grid-cols-2">
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Version label" className="rounded-xl border border-border bg-surface-2 p-2 text-sm" />
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Set active
          </label>
          <input value={asset.url} readOnly className="rounded-xl border border-border bg-surface-2 p-2 text-sm md:col-span-2" />
          <Button type="button" onClick={saveResume} disabled={pending} className="md:col-span-2">
            {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Resume Version
          </Button>
        </div>
      ) : null}
    </div>
  );
}
