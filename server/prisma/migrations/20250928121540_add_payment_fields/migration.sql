/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Order_paymentId_key";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "paymentId",
ADD COLUMN     "paymentAuthority" TEXT,
ADD COLUMN     "paymentRefId" TEXT;
