/*
  Warnings:

  - You are about to drop the `_HomepageSectionToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SectionType" AS ENUM ('MANUAL', 'DISCOUNTED', 'BEST_SELLING');

-- DropForeignKey
ALTER TABLE "public"."_HomepageSectionToProduct" DROP CONSTRAINT "_HomepageSectionToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_HomepageSectionToProduct" DROP CONSTRAINT "_HomepageSectionToProduct_B_fkey";

-- AlterTable
ALTER TABLE "public"."HomepageSection" ADD COLUMN     "type" "public"."SectionType" NOT NULL DEFAULT 'MANUAL';

-- DropTable
DROP TABLE "public"."_HomepageSectionToProduct";

-- CreateTable
CREATE TABLE "public"."_HomepageSectionToproduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_HomepageSectionToproduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HomepageSectionToproduct_B_index" ON "public"."_HomepageSectionToproduct"("B");

-- AddForeignKey
ALTER TABLE "public"."_HomepageSectionToproduct" ADD CONSTRAINT "_HomepageSectionToproduct_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."HomepageSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HomepageSectionToproduct" ADD CONSTRAINT "_HomepageSectionToproduct_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
