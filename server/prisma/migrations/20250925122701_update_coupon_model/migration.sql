/*
  Warnings:

  - You are about to drop the column `discountPercent` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Coupon` table. All the data in the column will be lost.
  - Added the required column `discountType` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expireDate` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Coupon" DROP COLUMN "discountPercent",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "discountType" TEXT NOT NULL,
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expireDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
