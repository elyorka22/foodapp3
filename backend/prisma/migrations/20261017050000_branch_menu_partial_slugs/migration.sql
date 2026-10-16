-- Product optional branch scope (null = shared across all branches)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "branch_id" UUID;

CREATE INDEX IF NOT EXISTS "products_branch_id_idx" ON "products"("branch_id");

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_branch_id_fkey";
ALTER TABLE "products"
  ADD CONSTRAINT "products_branch_id_fkey"
  FOREIGN KEY ("branch_id") REFERENCES "restaurant_branches"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Partial unique slugs: soft-deleted rows free the slug for reuse
ALTER TABLE "cities" DROP CONSTRAINT IF EXISTS "cities_slug_key";
DROP INDEX IF EXISTS "cities_slug_key";
CREATE UNIQUE INDEX "cities_slug_active_key" ON "cities"("slug") WHERE "deleted_at" IS NULL;

ALTER TABLE "business_types" DROP CONSTRAINT IF EXISTS "business_types_slug_key";
DROP INDEX IF EXISTS "business_types_slug_key";
CREATE UNIQUE INDEX "business_types_slug_active_key" ON "business_types"("slug") WHERE "deleted_at" IS NULL;

ALTER TABLE "restaurants" DROP CONSTRAINT IF EXISTS "restaurants_slug_key";
DROP INDEX IF EXISTS "restaurants_slug_key";
CREATE UNIQUE INDEX "restaurants_slug_active_key" ON "restaurants"("slug") WHERE "deleted_at" IS NULL;

-- Product slug unique only among active rows per business
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_restaurant_id_slug_key";
DROP INDEX IF EXISTS "products_restaurant_id_slug_key";
CREATE UNIQUE INDEX "products_business_slug_active_key"
  ON "products"("restaurant_id", "slug") WHERE "deleted_at" IS NULL;
