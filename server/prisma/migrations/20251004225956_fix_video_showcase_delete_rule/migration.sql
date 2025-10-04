-- DropForeignKey
ALTER TABLE "public"."video_showcase_items" DROP CONSTRAINT "video_showcase_items_productId_fkey";

-- AddForeignKey
ALTER TABLE "public"."video_showcase_items" ADD CONSTRAINT "video_showcase_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
