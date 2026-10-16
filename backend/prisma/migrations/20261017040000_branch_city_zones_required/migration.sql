-- Ensure every business has a city before NOT NULL
INSERT INTO "cities" ("id", "name", "slug", "sort_order", "is_active", "is_default", "created_at", "updated_at")
SELECT gen_random_uuid(), 'Toshkent', 'toshkent', 0, true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "cities" WHERE "deleted_at" IS NULL AND ("is_default" = true OR "slug" = 'toshkent')
);

UPDATE "restaurants" r
SET "city_id" = c."id"
FROM (
  SELECT "id" FROM "cities"
  WHERE "deleted_at" IS NULL
  ORDER BY "is_default" DESC, "sort_order" ASC, "created_at" ASC
  LIMIT 1
) c
WHERE r."city_id" IS NULL AND r."deleted_at" IS NULL;

-- Drop orphaned businesses without city (should be none after backfill)
UPDATE "restaurants"
SET "city_id" = (SELECT "id" FROM "cities" WHERE "deleted_at" IS NULL ORDER BY "is_default" DESC LIMIT 1)
WHERE "city_id" IS NULL;

ALTER TABLE "restaurants" ALTER COLUMN "city_id" SET NOT NULL;

-- Branch.cityId
ALTER TABLE "restaurant_branches" ADD COLUMN IF NOT EXISTS "city_id" UUID;

UPDATE "restaurant_branches" b
SET "city_id" = r."city_id"
FROM "restaurants" r
WHERE b."restaurant_id" = r."id" AND b."city_id" IS NULL;

UPDATE "restaurant_branches"
SET "city_id" = (SELECT "id" FROM "cities" WHERE "deleted_at" IS NULL ORDER BY "is_default" DESC LIMIT 1)
WHERE "city_id" IS NULL;

ALTER TABLE "restaurant_branches" ALTER COLUMN "city_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "restaurant_branches_city_id_idx" ON "restaurant_branches"("city_id");

ALTER TABLE "restaurant_branches"
  DROP CONSTRAINT IF EXISTS "restaurant_branches_city_id_fkey";

ALTER TABLE "restaurant_branches"
  ADD CONSTRAINT "restaurant_branches_city_id_fkey"
  FOREIGN KEY ("city_id") REFERENCES "cities"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Delivery zones: city / business / branch scope + circle geometry
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "city_id" UUID;
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "business_id" UUID;
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "branch_id" UUID;
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "center_latitude" DECIMAL(10, 7);
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "center_longitude" DECIMAL(10, 7);
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "radius_km" DECIMAL(8, 2);
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- polygon becomes optional
ALTER TABLE "delivery_zones" ALTER COLUMN "polygon" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "delivery_zones_city_id_is_active_idx" ON "delivery_zones"("city_id", "is_active");
CREATE INDEX IF NOT EXISTS "delivery_zones_business_id_idx" ON "delivery_zones"("business_id");
CREATE INDEX IF NOT EXISTS "delivery_zones_branch_id_idx" ON "delivery_zones"("branch_id");

ALTER TABLE "delivery_zones" DROP CONSTRAINT IF EXISTS "delivery_zones_city_id_fkey";
ALTER TABLE "delivery_zones" DROP CONSTRAINT IF EXISTS "delivery_zones_business_id_fkey";
ALTER TABLE "delivery_zones" DROP CONSTRAINT IF EXISTS "delivery_zones_branch_id_fkey";

ALTER TABLE "delivery_zones"
  ADD CONSTRAINT "delivery_zones_city_id_fkey"
  FOREIGN KEY ("city_id") REFERENCES "cities"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_zones"
  ADD CONSTRAINT "delivery_zones_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "restaurants"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_zones"
  ADD CONSTRAINT "delivery_zones_branch_id_fkey"
  FOREIGN KEY ("branch_id") REFERENCES "restaurant_branches"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
