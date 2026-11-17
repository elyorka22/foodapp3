-- AlterTable
ALTER TABLE "business_types" ADD COLUMN "home_grid_row" INTEGER NOT NULL DEFAULT 1;

-- Seed existing types into the historical home layout.
UPDATE "business_types"
SET "home_grid_row" = 2
WHERE "slug" IN ('restaurant', 'grocery')
  AND "deleted_at" IS NULL;

UPDATE "business_types"
SET "home_grid_row" = 1
WHERE "slug" IN ('flowers', 'perfume', 'pharmacy', 'gift', 'electronics')
  AND "deleted_at" IS NULL;

CREATE INDEX "business_types_is_active_home_grid_row_sort_order_idx"
  ON "business_types"("is_active", "home_grid_row", "sort_order");
