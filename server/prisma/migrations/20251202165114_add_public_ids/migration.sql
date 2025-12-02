/*
  Warnings:

  - Added the required column `imagePublicId` to the `FeatureBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoPublicId` to the `video_showcase_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Brand" ADD COLUMN     "logoPublicId" TEXT;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "public"."FeatureBanner" ADD COLUMN     "imageMobilePublicId" TEXT,
ADD COLUMN     "imagePublicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Image" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductCollection" ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "public"."video_showcase_items" ADD COLUMN     "videoPublicId" TEXT NOT NULL;
