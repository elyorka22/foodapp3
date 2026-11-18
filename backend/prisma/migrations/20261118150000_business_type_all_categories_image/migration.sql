-- «Barcha kategoriyalar» tile image on store menu (per business type).
ALTER TABLE "business_types"
  ADD COLUMN IF NOT EXISTS "all_categories_image_url" TEXT,
  ADD COLUMN IF NOT EXISTS "all_categories_image_scale" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "all_categories_image_position_x" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "all_categories_image_position_y" INTEGER NOT NULL DEFAULT 50;
