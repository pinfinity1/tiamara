-- CreateTable
CREATE TABLE "public"."video_showcase_items" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "video_showcase_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_showcase_items_productId_idx" ON "public"."video_showcase_items"("productId");

-- AddForeignKey
ALTER TABLE "public"."video_showcase_items" ADD CONSTRAINT "video_showcase_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
