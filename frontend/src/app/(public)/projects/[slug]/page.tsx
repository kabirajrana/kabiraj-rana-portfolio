import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { projects } from "@/lib/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 pb-24">
        <div className="pt-28" />
        <div className="mb-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
          >
            <span aria-hidden="true">←</span>
            Back to Projects
          </Link>
        </div>

        <header className="mb-8">
          <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">
            PROJECT
          </p>
          <h1 className="mt-3 font-[var(--font-serif)] text-4xl leading-tight tracking-tight md:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[rgb(var(--muted))] md:text-lg">
            {project.description}
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h2 className="text-sm font-medium text-[rgb(var(--fg))]">Tech Stack</h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-[rgb(var(--muted))]"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs tracking-[0.12em] text-[rgb(var(--fg))] transition-colors hover:border-white/20"
            >
              GitHub →
            </Link>
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs tracking-[0.12em] text-[rgb(var(--fg))] transition-colors hover:border-white/20"
            >
              Live Demo →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
