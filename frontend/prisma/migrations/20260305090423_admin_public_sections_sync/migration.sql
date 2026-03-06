-- CreateEnum
CREATE TYPE "SidePlacement" AS ENUM ('AUTO', 'LEFT', 'RIGHT');

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "sidePlacement" "SidePlacement" NOT NULL DEFAULT 'AUTO',
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "timeframe" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "year" TEXT;

-- AlterTable
ALTER TABLE "ResearchArticle" ADD COLUMN     "evaluationMetrics" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "problemStatement" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "year" TEXT;

-- CreateTable
CREATE TABLE "ProjectCategory" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectsPageConfig" (
    "id" TEXT NOT NULL,
    "smallLabel" TEXT NOT NULL DEFAULT 'PROJECTS',
    "title" TEXT NOT NULL DEFAULT 'All projects.',
    "subtitle" TEXT NOT NULL DEFAULT 'A curated collection of AI and engineering work built with product focus and production discipline.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectsPageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "codeLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "credentialUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperiencePageConfig" (
    "id" TEXT NOT NULL,
    "smallLabel" TEXT NOT NULL DEFAULT 'EXPERIENCE',
    "title" TEXT NOT NULL DEFAULT 'A journey of learning, iteration, and creation.',
    "subtitle" TEXT NOT NULL DEFAULT 'From focused self-learning to full-stack delivery, each step reflects consistent growth, practical execution, and deeper technical craftsmanship.',
    "showTimeline" BOOLEAN NOT NULL DEFAULT true,
    "showCertifications" BOOLEAN NOT NULL DEFAULT true,
    "certTitle" TEXT NOT NULL DEFAULT 'Formal Intelligence Expansion',
    "certSubtitle" TEXT NOT NULL DEFAULT 'Each certification reflects practical upskilling across AI, cloud, and modern software systems.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperiencePageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchPageConfig" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'AI Research & Experiments',
    "subtitle" TEXT NOT NULL DEFAULT 'Deep dives into machine learning systems, experiments, and real-world AI problem solving.',
    "description" TEXT NOT NULL DEFAULT 'This section documents experiments, model analysis, and technical explorations across machine learning, data science, and intelligent systems.',
    "heroChips" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchPageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchFilterTab" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchFilterTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPageConfig" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'kabirajrana76@gmail.com',
    "locationText" TEXT NOT NULL DEFAULT 'Kathmandu, Nepal (or Remote)',
    "responseTime" TEXT NOT NULL DEFAULT '24–48 hours',
    "socialLinks" JSONB NOT NULL,
    "availabilityEnabled" BOOLEAN NOT NULL DEFAULT true,
    "availabilityHeadline" TEXT NOT NULL DEFAULT 'Available for opportunities',
    "availabilitySubtext" TEXT NOT NULL DEFAULT 'Open to collaboration and ambitious AI/ML products.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCategory_slug_key" ON "ProjectCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchFilterTab_value_key" ON "ResearchFilterTab"("value");
