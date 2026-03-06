"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted">Please retry or check logs for details.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
