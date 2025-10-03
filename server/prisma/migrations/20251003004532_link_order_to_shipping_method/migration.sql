/*
  Warnings:

  - You are about to drop the column `shippingMethod` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "shippingMethod",
ADD COLUMN     "shippingMethodCode" TEXT;

-- CreateIndex
CREATE INDEX "Order_shippingMethodCode_idx" ON "public"."Order"("shippingMethodCode");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_shippingMethodCode_fkey" FOREIGN KEY ("shippingMethodCode") REFERENCES "public"."ShippingMethod"("code") ON DELETE SET NULL ON UPDATE CASCADE;
