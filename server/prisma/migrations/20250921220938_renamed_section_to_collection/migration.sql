/*
  Warnings:

  - You are about to drop the `HomepageSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_HomepageSectionToproduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."HomepageSection" DROP CONSTRAINT "HomepageSection_brandId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_HomepageSectionToproduct" DROP CONSTRAINT "_HomepageSectionToproduct_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_HomepageSectionToproduct" DROP CONSTRAINT "_HomepageSectionToproduct_B_fkey";

-- DropTable
DROP TABLE "public"."HomepageSection";

-- DropTable
DROP TABLE "public"."_HomepageSectionToproduct";

-- CreateTable
CREATE TABLE "public"."ProductCollection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "public"."SectionType" NOT NULL DEFAULT 'MANUAL',
    "location" TEXT DEFAULT 'homepage',
    "brandId" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ProductToProductCollection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToProductCollection_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ProductCollection_brandId_idx" ON "public"."ProductCollection"("brandId");

-- CreateIndex
CREATE INDEX "_ProductToProductCollection_B_index" ON "public"."_ProductToProductCollection"("B");

-- AddForeignKey
ALTER TABLE "public"."ProductCollection" ADD CONSTRAINT "ProductCollection_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToProductCollection" ADD CONSTRAINT "_ProductToProductCollection_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToProductCollection" ADD CONSTRAINT "_ProductToProductCollection_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProductCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
