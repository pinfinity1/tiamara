-- AlterEnum
ALTER TYPE "public"."SectionType" ADD VALUE 'BRAND';

-- AlterTable
ALTER TABLE "public"."FeatureBanner" ADD COLUMN     "group" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "public"."HomepageSection" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "location" TEXT DEFAULT 'homepage';
