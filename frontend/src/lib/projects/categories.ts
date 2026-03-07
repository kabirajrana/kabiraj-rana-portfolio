export const DEFAULT_PROJECT_FILTER_CATEGORIES = [
  "All project",
  "AI/ML",
  "Full-Stack",
  "Data Science",
  "Research",
] as const;

export const DEFAULT_PROJECT_CATEGORIES = ["AI/ML", "Full-Stack", "Data Science", "Research"] as const;

export type ProjectCategoryLabel = (typeof DEFAULT_PROJECT_CATEGORIES)[number];

export function normalizeProjectCategory(input: string | null | undefined): ProjectCategoryLabel {
  const value = String(input ?? "").trim().toLowerCase();
  if (!value) {
    return "AI/ML";
  }

  if (value === "ai/ml" || value === "ai" || value === "ml" || value.includes("ai")) {
    return "AI/ML";
  }

  if (value === "full-stack" || value === "full stack" || value === "fullstack") {
    return "Full-Stack";
  }

  if (value === "data science" || value === "data-science" || value.includes("data")) {
    return "Data Science";
  }

  if (value === "research" || value.includes("research")) {
    return "Research";
  }

  return "AI/ML";
}

export function isAllProjectFilter(input: string | null | undefined): boolean {
  const value = String(input ?? "").trim().toLowerCase();
  return value === "" || value === "all" || value === "all project" || value === "all projects";
}
