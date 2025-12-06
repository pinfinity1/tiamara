-- CreateEnum
CREATE TYPE "public"."GridSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterTable
ALTER TABLE "public"."Brand" ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "coverPublicId" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "gridSize" "public"."GridSize" NOT NULL DEFAULT 'SMALL';
