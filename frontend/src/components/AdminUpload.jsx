"use client";

import { useState } from "react";
import { useUpload } from "@/hooks/useUpload";

const ACCEPTED_TYPES = [
  "image/*",
  "application/pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
].join(",");

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const { upload, url, uploading, error } = useUpload();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await upload(file, "portfolio-assets");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Upload an asset
        </label>
        <input
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
        />
      </div>

      <button
        type="submit"
        disabled={!file || uploading}
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {uploading && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-400" />
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {url && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <p className="font-semibold">Uploaded successfully:</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="break-all underline"
          >
            {url}
          </a>
        </div>
      )}
    </form>
  );
}
