-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HERO', 'PROMO');

-- AlterTable
ALTER TABLE "banners" ADD COLUMN "description" TEXT;
ALTER TABLE "banners" ADD COLUMN "placement" "BannerPlacement" NOT NULL DEFAULT 'HERO';
ALTER TABLE "banners" ALTER COLUMN "title" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "banners_is_active_placement_idx" ON "banners"("is_active", "placement");
