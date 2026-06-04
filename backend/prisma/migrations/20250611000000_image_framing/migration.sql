-- Banner image framing (nullable = use global admin defaults)
ALTER TABLE "banners" ADD COLUMN "image_scale" INTEGER;
ALTER TABLE "banners" ADD COLUMN "image_position_x" INTEGER;
ALTER TABLE "banners" ADD COLUMN "image_position_y" INTEGER;

-- Restaurant card cover zoom
ALTER TABLE "restaurants" ADD COLUMN "cover_scale" INTEGER NOT NULL DEFAULT 100;
