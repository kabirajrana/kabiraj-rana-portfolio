-- CreateEnum
CREATE TYPE "ResearchType" AS ENUM ('EXPERIMENT', 'PAPER', 'SYSTEM', 'THESIS', 'NOTE');

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Research" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "type" "ResearchType" NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "year" INTEGER NOT NULL,
    "status" "ResearchStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "authors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affiliation" TEXT,
    "researchArea" TEXT,
    "dataset" TEXT,
    "duration" TEXT,
    "pdfUrl" TEXT,
    "codeUrl" TEXT,
    "demoUrl" TEXT,
    "notesUrl" TEXT,
    "coverImage" TEXT,
    "citation" TEXT,
    "references" JSONB,
    "relatedSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Research_slug_key" ON "Research"("slug");

-- CreateIndex
CREATE INDEX "Research_type_idx" ON "Research"("type");

-- CreateIndex
CREATE INDEX "Research_year_idx" ON "Research"("year");

-- CreateIndex
CREATE INDEX "Research_status_idx" ON "Research"("status");

-- CreateIndex
CREATE INDEX "Research_featured_idx" ON "Research"("featured");

-- CreateIndex
CREATE INDEX "Research_publishedAt_idx" ON "Research"("publishedAt");

-- Data migration from legacy ResearchArticle table.
INSERT INTO "Research" (
  "id",
  "slug",
  "title",
  "summary",
  "content",
  "type",
  "category",
  "tags",
  "year",
  "status",
  "featured",
  "authors",
  "affiliation",
  "researchArea",
  "dataset",
  "duration",
  "codeUrl",
  "citation",
  "references",
  "relatedSlugs",
  "seoTitle",
  "seoDescription",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  ra."id",
  ra."slug",
  ra."title",
  ra."abstract",
  CASE
    WHEN ra."category" = 'NOTES' THEN jsonb_build_object(
      'overview', COALESCE(ra."abstract", ''),
      'keyIdea', COALESCE(ra."problemStatement", ''),
      'explanation', COALESCE(ra."content", ''),
      'implications', COALESCE(ra."resultsSummary", ''),
      'references', COALESCE(ra."references", '[]'::jsonb)
    )
    WHEN ra."category" = 'SYSTEM_DESIGN' THEN jsonb_build_object(
      'overview', COALESCE(ra."abstract", ''),
      'problem', COALESCE(ra."problemStatement", ''),
      'systemDiagram', COALESCE(ra."content", ''),
      'components', COALESCE(ra."models", '[]'::jsonb),
      'dataFlow', COALESCE(ra."content", ''),
      'architectureDecisions', COALESCE(ra."methods", '[]'::jsonb),
      'techStack', COALESCE(ra."methods", '[]'::jsonb),
      'evaluation', COALESCE(ra."evaluationMetrics", ''),
      'conclusion', COALESCE(ra."resultsSummary", '')
    )
    WHEN ra."category" = 'MODEL_ARCHITECTURE' OR ra."category" = 'DATASET_STUDIES' THEN jsonb_build_object(
      'abstract', COALESCE(ra."abstract", ''),
      'introduction', COALESCE(ra."problemStatement", ''),
      'problemStatement', COALESCE(ra."problemStatement", ''),
      'relatedWork', '',
      'methodology', COALESCE(ra."methods", '[]'::jsonb),
      'systemArchitecture', COALESCE(ra."content", ''),
      'experiments', COALESCE(ra."content", ''),
      'results', COALESCE(ra."resultsSummary", ''),
      'discussion', COALESCE(ra."evaluationMetrics", ''),
      'conclusion', COALESCE(ra."resultsSummary", ''),
      'futureWork', ''
    )
    ELSE jsonb_build_object(
      'objective', COALESCE(ra."problemStatement", ra."abstract", ''),
      'dataset', COALESCE(ra."datasetUsed", ''),
      'method', COALESCE(ra."methods", '[]'::jsonb),
      'metrics', COALESCE(ra."evaluationMetrics", ''),
      'results', COALESCE(ra."resultsSummary", ''),
      'keyInsight', COALESCE(ra."resultsSummary", ''),
      'limitations', '',
      'nextSteps', ''
    )
  END AS "content",
  CASE
    WHEN ra."category" = 'NOTES' THEN 'NOTE'::"ResearchType"
    WHEN ra."category" = 'SYSTEM_DESIGN' THEN 'SYSTEM'::"ResearchType"
    WHEN ra."category" = 'MODEL_ARCHITECTURE' OR ra."category" = 'DATASET_STUDIES' THEN 'PAPER'::"ResearchType"
    ELSE 'EXPERIMENT'::"ResearchType"
  END AS "type",
  ra."category"::TEXT AS "category",
  CASE
    WHEN jsonb_typeof(ra."tags") = 'array' THEN ARRAY(SELECT jsonb_array_elements_text(ra."tags"))
    ELSE ARRAY[]::TEXT[]
  END AS "tags",
  CASE
    WHEN NULLIF(regexp_replace(COALESCE(ra."year", ''), '\\D', '', 'g'), '') IS NULL THEN EXTRACT(YEAR FROM COALESCE(ra."publishedAt", ra."createdAt"))::INT
    ELSE NULLIF(regexp_replace(ra."year", '\\D', '', 'g'), '')::INT
  END AS "year",
  CASE
    WHEN ra."status" = 'PUBLISHED' THEN 'PUBLISHED'::"ResearchStatus"
    WHEN ra."status" = 'ARCHIVED' THEN 'ARCHIVED'::"ResearchStatus"
    ELSE 'DRAFT'::"ResearchStatus"
  END AS "status",
  COALESCE(ra."featured", false) AS "featured",
  ARRAY['Kabiraj Rana']::TEXT[] AS "authors",
  'Independent AI Research Lab'::TEXT AS "affiliation",
  COALESCE(ra."category"::TEXT, 'General') AS "researchArea",
  ra."datasetUsed" AS "dataset",
  NULL::TEXT AS "duration",
  ra."githubRepoUrl" AS "codeUrl",
  NULL::TEXT AS "citation",
  ra."references" AS "references",
  ARRAY[]::TEXT[] AS "relatedSlugs",
  ra."title" AS "seoTitle",
  ra."abstract" AS "seoDescription",
  ra."publishedAt",
  ra."createdAt",
  ra."updatedAt"
FROM "ResearchArticle" ra
ON CONFLICT ("slug") DO NOTHING;
