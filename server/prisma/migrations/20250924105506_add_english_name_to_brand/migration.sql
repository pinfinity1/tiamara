/*
  Warnings:

  - A unique constraint covering the columns `[englishName]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Brand" ADD COLUMN     "englishName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_englishName_key" ON "public"."Brand"("englishName");
