import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const researchDelegate = (prisma as unknown as { research: { upsert: (args: unknown) => Promise<unknown> } }).research;

type ResearchSeedEntry = {
  slug: string;
  title: string;
  summary: string;
  type: "EXPERIMENT" | "PAPER" | "SYSTEM" | "THESIS" | "NOTE";
  year: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  authors: string[];
  affiliation: string;
  researchArea: string;
  dataset: string;
  duration: string;
  tags: string[];
  relatedSlugs: string[];
  content: Record<string, unknown>;
  references: Array<Record<string, unknown>>;
};

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMeNow123!";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      name: "Admin",
    },
  });

  await prisma.siteContent.upsert({
    where: { type: "HOME" },
    update: {},
    create: {
      type: "HOME",
      status: "DRAFT",
      draftJson: {
        heroTitle: "AI/ML Engineer",
        heroSubtitle: "Building intelligent systems and premium digital products.",
        heroTagline: "Research-driven engineering",
        ctas: [],
        featuredProjectIds: [],
        techHighlights: ["PyTorch", "TensorFlow", "Next.js"],
        toggles: { showProjects: true, showResearch: true, showExperience: true },
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { type: "ABOUT" },
    update: {},
    create: {
      type: "ABOUT",
      status: "DRAFT",
      draftJson: {
        bio: "",
        education: "",
        focusAreas: "",
        timelineNotes: "",
      },
    },
  });

  await prisma.systemSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "Kabiraj Rana",
      accentColor: "cyan",
      themeMode: "dark",
      socialLinks: {},
      maintenanceMode: false,
    },
  });

  await prisma.gitHubSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      githubUsername: process.env.GITHUB_USERNAME ?? "",
      enableGitHubDashboard: true,
      cacheRevalidateSeconds: 900,
      hiddenRepos: [],
      pinnedOverrides: [],
    },
  });

  await prisma.projectsPageConfig.upsert({
    where: { id: "default-projects" },
    update: {},
    create: {
      id: "default-projects",
      smallLabel: "PROJECTS",
      title: "All projects.",
      subtitle: "A curated collection of AI and engineering work built with product focus and production discipline.",
    },
  });

  const defaultCategories = [
    { label: "All Projects", slug: "all-projects", sortOrder: 0 },
    { label: "AI/ML", slug: "ai-ml", sortOrder: 1 },
    { label: "Full Stack", slug: "full-stack", sortOrder: 2 },
    { label: "Data Science", slug: "data-science", sortOrder: 3 },
  ];
  for (const category of defaultCategories) {
    await prisma.projectCategory.upsert({
      where: { slug: category.slug },
      update: { label: category.label, sortOrder: category.sortOrder, isVisible: true },
      create: { ...category, isVisible: true },
    });
  }

  await prisma.experiencePageConfig.upsert({
    where: { id: "default-experience" },
    update: {},
    create: {
      id: "default-experience",
      smallLabel: "EXPERIENCE",
      title: "A journey of learning, iteration, and creation.",
      subtitle:
        "From focused self-learning to full-stack delivery, each step reflects consistent growth, practical execution, and deeper technical craftsmanship.",
      showTimeline: true,
      showCertifications: true,
      certTitle: "Formal Intelligence Expansion",
      certSubtitle: "Each certification reflects practical upskilling across AI, cloud, and modern software systems.",
    },
  });

  const defaultCertifications = [
    { codeLabel: "C1", title: "IBM Data Science Certificate", credentialUrl: "https://coursera.org/share/d10000f3f38062a33e79d7e3f942ef32", sortOrder: 0 },
    { codeLabel: "C2", title: "AI for Everyone - DeepLearning.AI", credentialUrl: "https://coursera.org/share/bcb1acdf1fe4c763862449ab3095094b", sortOrder: 1 },
  ];
  for (const cert of defaultCertifications) {
    const existing = await prisma.certification.findFirst({ where: { codeLabel: cert.codeLabel } });
    if (!existing) {
      await prisma.certification.create({ data: { ...cert, isVisible: true } });
    }
  }

  await prisma.researchPageConfig.upsert({
    where: { id: "default-research" },
    update: {},
    create: {
      id: "default-research",
      title: "AI Research & Experiments",
      subtitle: "Deep dives into machine learning systems, experiments, and real-world AI problem solving.",
      description:
        "This section documents experiments, model analysis, and technical explorations across machine learning, data science, and intelligent systems.",
      heroChips: ["Model Analysis", "Experimentation", "Applied AI"],
    },
  });

  const defaultTabs = [
    { label: "All", value: "ALL", sortOrder: 0 },
    { label: "Experiments", value: "EXPERIMENTS", sortOrder: 1 },
    { label: "Model Architecture", value: "MODEL_ARCHITECTURE", sortOrder: 2 },
    { label: "Dataset Studies", value: "DATASET_STUDIES", sortOrder: 3 },
    { label: "System Design", value: "SYSTEM_DESIGN", sortOrder: 4 },
  ];
  for (const tab of defaultTabs) {
    await prisma.researchFilterTab.upsert({
      where: { value: tab.value },
      update: { label: tab.label, sortOrder: tab.sortOrder, isVisible: true },
      create: { ...tab, isVisible: true },
    });
  }

  const researchSeed: ResearchSeedEntry[] = [
    {
      slug: "reproducible-ml-training-systems",
      title: "Reproducible ML Training Systems for Fast Iteration",
      summary: "Experiment on deterministic training pipelines across mixed GPU nodes with reproducibility guardrails and artifact lineage.",
      type: "EXPERIMENT",
      year: 2026,
      status: "PUBLISHED",
      featured: true,
      authors: ["Kabiraj Rana"],
      affiliation: "Independent AI Research Lab",
      researchArea: "ML Systems",
      dataset: "OpenML-CC18 benchmark subsets",
      duration: "8 weeks",
      tags: ["reproducibility", "mlops", "training-pipelines"],
      relatedSlugs: ["feature-store-architecture-low-latency-ml"],
      content: {
        objective: "Quantify reproducibility drift across multi-run distributed training.",
        dataset: "OpenML-CC18 subsets with fixed snapshot versions.",
        method: "Containerized training jobs with seed controls, artifact fingerprinting, and deterministic dataloaders.",
        metrics: "Run-to-run variance, metric confidence intervals, and deployment parity scores.",
        results: "Reduced training variance by 61% and improved rollback confidence with versioned artifacts.",
        keyInsight: "Strict data/version contracts provide larger reproducibility gains than seed settings alone.",
        limitations: "Focused on supervised workloads; RL reproducibility behavior was not evaluated.",
        nextSteps: "Extend design to online-learning jobs with data freshness constraints.",
      },
      references: [],
    },
    {
      slug: "real-time-data-drift-detection-streaming",
      title: "Real-Time Data Drift Detection in Streaming Inference",
      summary: "Experiment evaluating drift detection pipelines for low-latency model serving environments.",
      type: "EXPERIMENT",
      year: 2026,
      status: "PUBLISHED",
      featured: false,
      authors: ["Kabiraj Rana"],
      affiliation: "Independent AI Research Lab",
      researchArea: "Data Infrastructure",
      dataset: "Synthetic + production-style telemetry streams",
      duration: "6 weeks",
      tags: ["data-drift", "streaming", "ml-observability"],
      relatedSlugs: ["reproducible-ml-training-systems"],
      content: {
        objective: "Build a practical detector stack for data drift under strict latency budgets.",
        dataset: "Feature event streams with controlled concept drift injections.",
        method: "Sliding-window KS tests, PSI monitoring, and adaptive thresholds tied to model risk bands.",
        metrics: "Detection latency, false positive rate, and downstream model quality retention.",
        results: "Median detection time dropped to 42s with 3.4% false positives.",
        keyInsight: "Risk-weighted thresholding outperformed static thresholds during burst traffic.",
        limitations: "Evaluation focused on tabular events and excluded raw image payloads.",
        nextSteps: "Introduce multimodal drift signatures and active feedback loops.",
      },
      references: [],
    },
    {
      slug: "transformer-vs-lstm-text-classification",
      title: "Transformer vs LSTM for Domain-Shifted Text Classification",
      summary: "Publication-style comparative study on model robustness under cross-domain text drift.",
      type: "PAPER",
      year: 2025,
      status: "PUBLISHED",
      featured: true,
      authors: ["Kabiraj Rana"],
      affiliation: "Independent AI Research Lab",
      researchArea: "Model Architecture",
      dataset: "IMDb, AG News, and Nepali-English mixed corpora",
      duration: "10 weeks",
      tags: ["transformers", "lstm", "nlp"],
      relatedSlugs: ["brain-drain-nepal-youth-migration-thesis"],
      content: {
        abstract: "A comparative analysis of sequence architectures under domain shift conditions.",
        introduction: "Generalization gaps emerge when models face lexical and topical drift.",
        problemStatement: "How robust are transformers relative to LSTMs in low-resource shift scenarios?",
        relatedWork: "Prior studies focus on in-domain benchmarks with limited domain stress testing.",
        methodology: "Controlled train/validation splits with domain-shifted holdouts and calibration analysis.",
        systemArchitecture: "Dual-pipeline benchmark runner with shared tokenizer contracts and evaluation harness.",
        experiments: "Model sweeps across architecture depth, context windows, and transfer settings.",
        results: "Transformers achieved higher aggregate accuracy while LSTMs retained stability in narrow domains.",
        discussion: "Architecture choice depends on deployment constraints and drift profile severity.",
        conclusion: "Hybrid fallback strategies can improve reliability in resource-constrained environments.",
        futureWork: "Explore retrieval-augmented lightweight encoders for robust low-latency serving.",
      },
      references: [
        { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762" }
      ],
    },
    {
      slug: "feature-store-architecture-low-latency-ml",
      title: "Feature Store Architecture for Low-Latency ML Systems",
      summary: "System design documentation for an online/offline feature platform with governance and traceability.",
      type: "SYSTEM",
      year: 2025,
      status: "PUBLISHED",
      featured: true,
      authors: ["Kabiraj Rana"],
      affiliation: "Independent AI Research Lab",
      researchArea: "Intelligent Infrastructure",
      dataset: "Multi-source product telemetry",
      duration: "12 weeks",
      tags: ["feature-store", "system-design", "real-time-ml"],
      relatedSlugs: ["reproducible-ml-training-systems"],
      content: {
        overview: "Design for consistent feature definitions between training and serving.",
        problem: "Feature inconsistency and stale retrieval caused model quality regressions.",
        systemDiagram: "flowchart TD\nA[Event Streams] --> B[Feature Compute]\nB --> C[Online Store]\nB --> D[Offline Store]\nC --> E[Model Serving]\nD --> F[Training Pipelines]",
        components: "Ingestion, transformation graph, online KV layer, offline lakehouse sync, and governance APIs.",
        dataFlow: "Streaming + batch harmonization with schema contracts and time-travel snapshots.",
        architectureDecisions: "CQRS separation, immutable feature definitions, and point-in-time correctness checks.",
        techStack: "Kafka, dbt, Redis, PostgreSQL, object storage, and Next.js admin console.",
        evaluation: "P99 online read latency under 25ms with 99.7% offline/online parity.",
        conclusion: "The architecture reduced training-serving skew and improved incident recovery speed.",
      },
      references: [],
    },
    {
      slug: "brain-drain-nepal-youth-migration-thesis",
      title: "Brain Drain and Youth Migration from Nepal: Data-Driven Thesis",
      summary: "Long-form thesis combining socioeconomic analysis with applied ML forecasting for migration trends.",
      type: "THESIS",
      year: 2024,
      status: "PUBLISHED",
      featured: false,
      authors: ["Kabiraj Rana"],
      affiliation: "Independent Research",
      researchArea: "Applied AI",
      dataset: "National labor and migration statistics",
      duration: "6 months",
      tags: ["thesis", "nepal", "migration", "applied-ai"],
      relatedSlugs: ["transformer-vs-lstm-text-classification"],
      content: {
        abstract: "A mixed-method thesis modeling migration dynamics and policy-sensitive predictors.",
        context: "Nepal faces sustained outbound youth migration with long-term national implications.",
        researchQuestion: "Which factors most strongly influence youth migration intention and outcomes?",
        literatureReview: "Survey of migration economics, labor mobility, and social network effects.",
        methodology: "Hybrid econometric + ML modeling with panel trend decomposition.",
        implementation: "Data cleaning pipelines, feature engineering, and interpretable forecasting models.",
        findings: "Employment volatility and perceived opportunity asymmetry were key leading indicators.",
        discussion: "Results suggest targeted regional opportunity programs may reduce migration pressure.",
        conclusion: "Policy interventions can be prioritized using interpretable risk segmentation.",
        limitations: "Data incompleteness across informal labor cohorts limits confidence in some regions.",
        futureWork: "Integrate satellite socioeconomic proxies and longitudinal survey updates.",
        appendix: "Questionnaires, variable definitions, and model sensitivity diagnostics.",
      },
      references: [],
    },
    {
      slug: "lightweight-guardrails-for-agentic-workflows",
      title: "Lightweight Guardrails for Agentic Workflow Reliability",
      summary: "Technical note on practical guardrail patterns for autonomous AI task execution.",
      type: "NOTE",
      year: 2026,
      status: "PUBLISHED",
      featured: false,
      authors: ["Kabiraj Rana"],
      affiliation: "Independent AI Research Lab",
      researchArea: "Applied AI",
      dataset: "",
      duration: "2 weeks",
      tags: ["agentic-ai", "reliability", "guardrails"],
      relatedSlugs: ["real-time-data-drift-detection-streaming"],
      content: {
        overview: "Simple policy and validation layers can significantly improve autonomous task quality.",
        keyIdea: "Use layered constraints: input policy, execution policy, and output contract validation.",
        explanation: "The combined approach catches most high-impact errors without heavy orchestration overhead.",
        implications: "Teams can adopt agent workflows faster while preserving trust and auditability.",
        references: "Internal implementation notes and public reliability benchmarks.",
      },
      references: [],
    },
  ];

  for (const entry of researchSeed) {
    const payload = {
      ...entry,
      content: entry.content as Prisma.InputJsonValue,
      references: entry.references as Prisma.InputJsonValue,
      publishedAt: entry.status === "PUBLISHED" ? new Date() : null,
      seoTitle: entry.title,
      seoDescription: entry.summary,
    };

    await researchDelegate.upsert({
      where: { slug: entry.slug },
      update: payload,
      create: payload,
    });
  }

  await prisma.contactPageConfig.upsert({
    where: { id: "default-contact" },
    update: {},
    create: {
      id: "default-contact",
      email: "kabirajrana76@gmail.com",
      locationText: "Kathmandu, Nepal (or Remote)",
      responseTime: "24–48 hours",
      socialLinks: {
        github: "https://github.com/kabirajrana",
        linkedin: "https://www.linkedin.com/",
      },
      availabilityEnabled: true,
      availabilityHeadline: "Available for opportunities",
      availabilitySubtext: "Open to collaboration and ambitious AI/ML products.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
