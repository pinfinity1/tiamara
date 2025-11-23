-- AlterTable
ALTER TABLE "public"."FeatureBanner" ADD COLUMN     "buttonText" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "textColor" TEXT DEFAULT '#000000',
ADD COLUMN     "title" TEXT;
