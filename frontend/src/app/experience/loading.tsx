import { Container } from "@/components/layout/container";

export default function ExperienceLoading() {
  return (
    <Container className="space-y-6 py-16 md:py-24">
      <div className="mx-auto h-24 w-full max-w-3xl animate-pulse rounded-3xl border border-border/60 bg-surface/55 backdrop-blur" />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/45 p-6 backdrop-blur">
          <div className="h-4 w-28 animate-pulse rounded bg-text/10" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-text/10" />
          <div className="h-3 w-full animate-pulse rounded bg-text/10" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-text/10" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-text/10" />
          <div className="mt-3 h-40 animate-pulse rounded-2xl border border-border/50 bg-background/45" />
        </div>

        <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/45 p-6 backdrop-blur">
          <div className="h-4 w-32 animate-pulse rounded bg-text/10" />
          <div className="h-9 w-full animate-pulse rounded bg-text/10" />
          <div className="h-9 w-full animate-pulse rounded bg-text/10" />
          <div className="h-9 w-5/6 animate-pulse rounded bg-text/10" />
          <div className="mt-2 h-32 animate-pulse rounded-2xl border border-border/50 bg-background/45" />
        </div>
      </div>
    </Container>
  );
}
