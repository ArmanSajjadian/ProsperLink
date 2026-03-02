-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "adminComment" TEXT;
