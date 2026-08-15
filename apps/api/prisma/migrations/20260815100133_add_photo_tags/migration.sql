-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
