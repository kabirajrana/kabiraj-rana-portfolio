"use client";

import { useEffect } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  const errorMessage = (() => {
    if (error instanceof globalThis.Error) {
      return error.message;
    }

    if (typeof globalThis.Event !== "undefined" && error instanceof globalThis.Event) {
      return `Unexpected ${error.type || "runtime"} event error`;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Unexpected runtime error";
  })();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-28 text-center">
      <h2 className="text-3xl font-semibold tracking-tight">Something went wrong</h2>
      <p className="mt-3 text-muted">{errorMessage}</p>
      <Button className="mt-7" onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}