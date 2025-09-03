/*
  Warnings:

  - You are about to drop the column `colors` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `sizes` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."product" DROP COLUMN "colors",
DROP COLUMN "gender",
DROP COLUMN "rating",
DROP COLUMN "sizes",
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "average_rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "caution" TEXT,
ADD COLUMN     "concern" TEXT[],
ADD COLUMN     "country_of_origin" TEXT,
ADD COLUMN     "discount_price" DOUBLE PRECISION,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "how_to_use" TEXT,
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "manufacture_date" TIMESTAMP(3),
ADD COLUMN     "product_form" TEXT,
ADD COLUMN     "review_count" INTEGER DEFAULT 0,
ADD COLUMN     "skin_type" TEXT[],
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "volume" DOUBLE PRECISION,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "public"."product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcode_key" ON "public"."product"("barcode");
