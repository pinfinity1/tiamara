-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "productPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "skinConcerns" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "skinType" TEXT,
ADD COLUMN     "skincareGoals" TEXT[] DEFAULT ARRAY[]::TEXT[];
