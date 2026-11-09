-- Framing for store category circle images (same fields as dish categories).

ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image_scale" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image_position_x" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image_position_y" INTEGER NOT NULL DEFAULT 50;
