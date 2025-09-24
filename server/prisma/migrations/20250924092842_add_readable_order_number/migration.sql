/*
  Warnings:

  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderNumber" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."OrderCounter" (
    "id" TEXT NOT NULL DEFAULT 'order_counter',
    "lastOrderNumber" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "OrderCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");
