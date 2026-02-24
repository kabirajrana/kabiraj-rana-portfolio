"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import type { PortfolioProject } from "@/lib/projects";

type ProjectCardProps = {
  project: PortfolioProject;
  variant?: "featured" | "full";
};

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ProjectCard({ project, variant = "featured" }: ProjectCardProps) {
  const isFeatured = variant === "featured";

  return (
    <motion.article
      whileHover={{
        y: -2,
        borderColor: "rgba(255,255,255,0.22)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.10)",
      }}
      transition={{ duration: 0.42, ease }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-medium tracking-tight text-[rgb(var(--fg))]">{project.title}</h3>
          <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-[rgb(var(--muted))]">
            {project.description}
          </p>
        </div>

        {isFeatured ? (
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`Open ${project.title} case study`}
            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[rgb(var(--fg))] transition-colors hover:border-white/20"
          >
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-[rgb(var(--muted))]"
          >
            {tag}
          </span>
        ))}
      </div>

      {isFeatured ? (
        <>
          <div className="mt-5 h-px w-full bg-white/10" />
          <p className="mt-4 text-xs tracking-[0.22em] text-[rgb(var(--muted))]">CASE STUDY</p>
        </>
      ) : (
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
      )}
    </motion.article>
  );
}
