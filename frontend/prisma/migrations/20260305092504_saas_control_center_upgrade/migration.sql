-- AlterEnum
ALTER TYPE "PublishStatus" ADD VALUE 'SCHEDULED';

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorAdminId" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ResearchArticle" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SiteContent" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SystemSetting" ADD COLUMN     "availabilityEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availabilityHeadline" TEXT NOT NULL DEFAULT 'Available for opportunities',
ADD COLUMN     "availabilitySubtext" TEXT NOT NULL DEFAULT 'Open to collaboration and ambitious AI/ML products.',
ADD COLUMN     "borderRadiusScale" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "enableExperience" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableGitHub" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableProjects" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableResearch" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "glowIntensity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "locationText" TEXT NOT NULL DEFAULT 'Kathmandu, Nepal (or Remote)',
ADD COLUMN     "primaryEmail" TEXT NOT NULL DEFAULT 'kabirajrana76@gmail.com',
ADD COLUMN     "responseTimeText" TEXT NOT NULL DEFAULT '24–48 hours',
ADD COLUMN     "xUrl" TEXT;

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "actorAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthReport" (
    "id" TEXT NOT NULL,
    "checks" JSONB NOT NULL,
    "warnings" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupImportLog" (
    "id" TEXT NOT NULL,
    "actorAdminId" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "importedCounts" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentRevision_entityType_entityId_createdAt_idx" ON "ContentRevision"("entityType", "entityId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackupImportLog" ADD CONSTRAINT "BackupImportLog_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
