"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import ProjectCard from "@/components/projects/ProjectCard";
import { projects } from "@/lib/projects";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const featuredProjects = projects.filter((project) => project.featured).slice(0, 2);

export default function ProjectsSection() {
  return (
    <section id="projects" aria-label="Projects" className="relative scroll-mt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">PROJECTS</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl tracking-tight md:text-4xl">
              Selected work.
            </h2>
          </div>

          <Link
            href="/projects"
            className="text-sm text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))]"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease, delay: index * 0.14 }}
            >
              <ProjectCard project={project} variant="featured" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
