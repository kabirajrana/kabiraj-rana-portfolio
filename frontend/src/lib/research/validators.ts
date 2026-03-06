import { z } from "zod";

import {
  experimentContentSchema,
  noteContentSchema,
  paperContentSchema,
  researchByTypeSchema,
  systemContentSchema,
  thesisContentSchema,
  researchTypeSchema,
} from "@/lib/research/schemas";
import type { ResearchContent, ResearchType } from "@/lib/research/types";

function toText(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (Array.isArray(value)) {
    const joined = value.map((item) => String(item ?? "")).join(", ").trim();
    return joined || fallback;
  }

  if (value && typeof value === "object") {
    const json = JSON.stringify(value);
    return json === "{}" ? fallback : json;
  }

  return fallback;
}

export function validateResearchContentByType(type: ResearchType, content: unknown) {
  const schema = researchByTypeSchema[type];
  return schema.parse(content);
}

export function safeValidateResearchContentByType(type: ResearchType, content: unknown) {
  const schema = researchByTypeSchema[type];
  return schema.safeParse(content);
}

const legacyExperimentSchema = z.object({
  objective: z.string().optional(),
  dataset: z.string().optional(),
  method: z.union([z.string(), z.array(z.string())]).optional(),
  metrics: z.union([z.string(), z.array(z.string())]).optional(),
  results: z.string().optional(),
  keyInsight: z.string().optional(),
  limitations: z.string().optional(),
  nextSteps: z.string().optional(),
});

export function normalizeResearchContent(type: ResearchType, content: unknown): ResearchContent {
  const typed = researchTypeSchema.parse(type);
  const base = content && typeof content === "object" ? (content as Record<string, unknown>) : {};

  if (typed === "EXPERIMENT") {
    const parsed = legacyExperimentSchema.safeParse(content);
    if (parsed.success) {
      const data = parsed.data;
      return experimentContentSchema.parse({
        objective: toText(data.objective, "Objective pending update."),
        dataset: toText(data.dataset, "Dataset pending update."),
        method: toText(data.method, "Method pending update."),
        metrics: toText(data.metrics, "Metrics pending update."),
        results: toText(data.results, "Results pending update."),
        keyInsight: toText(data.keyInsight ?? data.results, "Insight pending update."),
        limitations: toText(data.limitations, "Limitations pending update."),
        nextSteps: toText(data.nextSteps, "Next steps pending update."),
      });
    }

    return experimentContentSchema.parse({
      objective: toText(base.objective, "Objective pending update."),
      dataset: toText(base.dataset, "Dataset pending update."),
      method: toText(base.method, "Method pending update."),
      metrics: toText(base.metrics, "Metrics pending update."),
      results: toText(base.results, "Results pending update."),
      keyInsight: toText(base.keyInsight, "Insight pending update."),
      limitations: toText(base.limitations, "Limitations pending update."),
      nextSteps: toText(base.nextSteps, "Next steps pending update."),
    });
  }

  if (typed === "PAPER") {
    return paperContentSchema.parse({
      abstract: toText(base.abstract, "Abstract pending update."),
      introduction: toText(base.introduction, "Introduction pending update."),
      problemStatement: toText(base.problemStatement, "Problem statement pending update."),
      relatedWork: toText(base.relatedWork, "Related work pending update."),
      methodology: toText(base.methodology, "Methodology pending update."),
      systemArchitecture: toText(base.systemArchitecture, "System architecture pending update."),
      experiments: toText(base.experiments, "Experiments pending update."),
      results: toText(base.results, "Results pending update."),
      discussion: toText(base.discussion, "Discussion pending update."),
      conclusion: toText(base.conclusion, "Conclusion pending update."),
      futureWork: toText(base.futureWork, "Future work pending update."),
    });
  }

  if (typed === "SYSTEM") {
    return systemContentSchema.parse({
      overview: toText(base.overview, "Overview pending update."),
      problem: toText(base.problem, "Problem pending update."),
      systemDiagram: toText(base.systemDiagram, ""),
      components: toText(base.components, "Components pending update."),
      dataFlow: toText(base.dataFlow, "Data flow pending update."),
      architectureDecisions: toText(base.architectureDecisions, "Architecture decisions pending update."),
      techStack: toText(base.techStack, "Tech stack pending update."),
      evaluation: toText(base.evaluation, "Evaluation pending update."),
      conclusion: toText(base.conclusion, "Conclusion pending update."),
    });
  }

  if (typed === "THESIS") {
    return thesisContentSchema.parse({
      abstract: toText(base.abstract, "Abstract pending update."),
      context: toText(base.context, "Context pending update."),
      researchQuestion: toText(base.researchQuestion, "Research question pending update."),
      literatureReview: toText(base.literatureReview, "Literature review pending update."),
      methodology: toText(base.methodology, "Methodology pending update."),
      implementation: toText(base.implementation, "Implementation pending update."),
      findings: toText(base.findings, "Findings pending update."),
      discussion: toText(base.discussion, "Discussion pending update."),
      conclusion: toText(base.conclusion, "Conclusion pending update."),
      limitations: toText(base.limitations, "Limitations pending update."),
      futureWork: toText(base.futureWork, "Future work pending update."),
      appendix: toText(base.appendix, "Appendix pending update."),
    });
  }

  if (typed === "NOTE") {
    return noteContentSchema.parse({
      overview: toText(base.overview, "Overview pending update."),
      keyIdea: toText(base.keyIdea, "Key idea pending update."),
      explanation: toText(base.explanation, "Explanation pending update."),
      implications: toText(base.implications, "Implications pending update."),
      references: toText(base.references, "References pending update."),
    });
  }

  return validateResearchContentByType(typed, content);
}
