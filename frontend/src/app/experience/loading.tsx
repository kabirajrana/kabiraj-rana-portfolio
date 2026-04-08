import { Container } from "@/components/layout/container";

export default function ExperienceLoading() {
  return (
    <Container className="pt-16 md:pt-24">
      <section className="mx-auto max-w-3xl text-center">
        <p className="section-subtitle justify-center">EXPERIENCE</p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Loading experience
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Preparing timeline and credentials...
        </p>
        <div className="mx-auto mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-border/60">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-accent/80" />
        </div>
      </section>
    </Container>
  );
}
