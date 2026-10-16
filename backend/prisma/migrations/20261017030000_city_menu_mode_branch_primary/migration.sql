-- BusinessMenuMode enum
CREATE TYPE "BusinessMenuMode" AS ENUM ('GLOBAL_DISH', 'OWN_CATEGORIES');

-- BusinessType.menuMode + soft-delete
ALTER TABLE "business_types" ADD COLUMN "menu_mode" "BusinessMenuMode" NOT NULL DEFAULT 'OWN_CATEGORIES';
ALTER TABLE "business_types" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Restaurant vertical uses global dish categories
UPDATE "business_types" SET "menu_mode" = 'GLOBAL_DISH' WHERE "slug" = 'restaurant';

-- Deprecated CONTACT catalog mode → CATALOG
UPDATE "business_types" SET "catalog_mode" = 'CATALOG' WHERE "catalog_mode" = 'CONTACT';

-- Business.cityId
ALTER TABLE "restaurants" ADD COLUMN "city_id" UUID;

-- Ensure default city exists, then backfill
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

CREATE INDEX "restaurants_city_id_idx" ON "restaurants"("city_id");

ALTER TABLE "restaurants"
  ADD CONSTRAINT "restaurants_city_id_fkey"
  FOREIGN KEY ("city_id") REFERENCES "cities"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Branch isPrimary
ALTER TABLE "restaurant_branches" ADD COLUMN "is_primary" BOOLEAN NOT NULL DEFAULT false;

-- Mark oldest active branch per business as primary
UPDATE "restaurant_branches" b
SET "is_primary" = true
FROM (
  SELECT DISTINCT ON ("restaurant_id") "id"
  FROM "restaurant_branches"
  WHERE "deleted_at" IS NULL AND "is_active" = true
  ORDER BY "restaurant_id", "created_at" ASC
) first_branch
WHERE b."id" = first_branch."id";

CREATE INDEX "restaurant_branches_restaurant_id_is_primary_idx"
  ON "restaurant_branches"("restaurant_id", "is_primary");
