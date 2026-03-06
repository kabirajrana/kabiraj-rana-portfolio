export const RESEARCH_TYPES = ["EXPERIMENT", "PAPER", "SYSTEM", "THESIS", "NOTE"] as const;
export type ResearchType = (typeof RESEARCH_TYPES)[number];

export const RESEARCH_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ResearchStatus = (typeof RESEARCH_STATUS)[number];

export type ExperimentContent = {
  objective: string;
  dataset: string;
  method: string;
  metrics: string;
  results: string;
  keyInsight: string;
  limitations: string;
  nextSteps: string;
};

export type PaperContent = {
  abstract: string;
  introduction: string;
  problemStatement: string;
  relatedWork: string;
  methodology: string;
  systemArchitecture: string;
  experiments: string;
  results: string;
  discussion: string;
  conclusion: string;
  futureWork: string;
};

export type SystemContent = {
  overview: string;
  problem: string;
  systemDiagram: string;
  components: string;
  dataFlow: string;
  architectureDecisions: string;
  techStack: string;
  evaluation: string;
  conclusion: string;
};

export type ThesisContent = {
  abstract: string;
  context: string;
  researchQuestion: string;
  literatureReview: string;
  methodology: string;
  implementation: string;
  findings: string;
  discussion: string;
  conclusion: string;
  limitations: string;
  futureWork: string;
  appendix: string;
};

export type NoteContent = {
  overview: string;
  keyIdea: string;
  explanation: string;
  implications: string;
  references: string;
};

export type ResearchContentByType = {
  EXPERIMENT: ExperimentContent;
  PAPER: PaperContent;
  SYSTEM: SystemContent;
  THESIS: ThesisContent;
  NOTE: NoteContent;
};

export type ResearchContent = ResearchContentByType[ResearchType];

export type ResearchRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: ResearchContent;
  type: ResearchType;
  category?: string | null;
  tags: string[];
  year: number;
  status: ResearchStatus;
  featured: boolean;
  authors: string[];
  affiliation?: string | null;
  researchArea?: string | null;
  dataset?: string | null;
  duration?: string | null;
  pdfUrl?: string | null;
  codeUrl?: string | null;
  demoUrl?: string | null;
  notesUrl?: string | null;
  coverImage?: string | null;
  citation?: string | null;
  references?: unknown;
  relatedSlugs: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const RESEARCH_TRACKS = [
  { key: "ALL", label: "All" },
  { key: "PAPER", label: "Publications" },
  { key: "EXPERIMENT", label: "Experiments" },
  { key: "NOTE", label: "Technical Notes" },
  { key: "SYSTEM", label: "System Designs" },
  { key: "THESIS", label: "Thesis" },
] as const;

export const RESEARCH_FOCUS_AREAS = [
  "ML Systems",
  "Model Architecture",
  "Data Infrastructure",
  "Applied AI",
  "Intelligent Automation",
] as const;

export function getTypeLabel(type: ResearchType): string {
  switch (type) {
    case "PAPER":
      return "Publication";
    case "EXPERIMENT":
      return "Experiment";
    case "NOTE":
      return "Technical Note";
    case "SYSTEM":
      return "System Design";
    case "THESIS":
      return "Thesis";
    default:
      return type;
  }
}
