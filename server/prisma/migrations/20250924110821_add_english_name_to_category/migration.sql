/*
  Warnings:

  - A unique constraint covering the columns `[englishName]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "englishName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_englishName_key" ON "public"."Category"("englishName");
