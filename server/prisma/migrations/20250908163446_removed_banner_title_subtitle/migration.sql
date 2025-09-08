/*
  Warnings:

  - You are about to drop the column `subtitle` on the `FeatureBanner` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `FeatureBanner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."FeatureBanner" DROP COLUMN "subtitle",
DROP COLUMN "title";
