-- CreateIndex
CREATE INDEX "HomepageSection_brandId_idx" ON "public"."HomepageSection"("brandId");

-- AddForeignKey
ALTER TABLE "public"."HomepageSection" ADD CONSTRAINT "HomepageSection_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
