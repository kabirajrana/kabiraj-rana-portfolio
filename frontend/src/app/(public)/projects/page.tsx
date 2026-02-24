"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";

import ProjectCard from "@/components/projects/ProjectCard";
import { projects } from "@/lib/projects";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-[calc(var(--nav-h,80px)+2.5rem)] sm:pt-[calc(var(--nav-h,80px)+3rem)]">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-xs tracking-[0.28em] text-[rgb(var(--muted))]">PROJECTS</p>
          <h1 className="mt-3 font-[var(--font-serif)] text-4xl leading-tight tracking-tight md:text-5xl">
            All projects.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))] md:text-base">
            A curated collection of AI and engineering work built with product focus and production discipline.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease, delay: 0.06 }}
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease, delay: index * 0.1 }}
            >
              <ProjectCard project={project} variant="full" />
            </motion.div>
          ))}
        </motion.section>
      </main>
    </>
  );
}
