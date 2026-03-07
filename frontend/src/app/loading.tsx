import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur">
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-accent/35" />
        <div className="mb-8 h-9 w-3/4 animate-pulse rounded-md bg-text/10" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl border border-border/50 bg-background/45" />
          <div className="space-y-3 rounded-2xl border border-border/50 bg-background/35 p-4">
            <div className="h-3 w-full animate-pulse rounded bg-text/10" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-text/10" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-text/10" />
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-text/10">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-400/70 via-sky-400/70 to-indigo-400/70" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}