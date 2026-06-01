-- Category card image framing (zoom + focal point) for marketplace /shops grid
ALTER TABLE "business_types" ADD COLUMN "image_scale" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "business_types" ADD COLUMN "image_position_x" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "business_types" ADD COLUMN "image_position_y" INTEGER NOT NULL DEFAULT 50;
