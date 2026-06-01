-- Business types (marketplace categories)
CREATE TABLE "business_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_types_slug_key" ON "business_types"("slug");
CREATE INDEX "business_types_is_active_sort_order_idx" ON "business_types"("is_active", "sort_order");

ALTER TABLE "restaurants" ADD COLUMN "business_type_id" UUID;
ALTER TABLE "restaurants" ADD COLUMN "average_rating" DECIMAL(3,2) DEFAULT 4.5;
ALTER TABLE "restaurants" ADD COLUMN "review_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_business_type_id_fkey"
    FOREIGN KEY ("business_type_id") REFERENCES "business_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "restaurants_business_type_id_idx" ON "restaurants"("business_type_id");

-- Migrate user roles: RESTAURANT_* -> BUSINESS
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'BUSINESS', 'COURIER');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (
    CASE "role"::text
        WHEN 'RESTAURANT_OWNER' THEN 'BUSINESS'::"UserRole_new"
        WHEN 'RESTAURANT_STAFF' THEN 'BUSINESS'::"UserRole_new"
        ELSE "role"::text::"UserRole_new"
    END
);

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Seed marketplace business types
INSERT INTO "business_types" ("id", "name", "slug", "icon", "sort_order", "is_active", "created_at", "updated_at")
SELECT gen_random_uuid(), v.name, v.slug, v.icon, v.sort_order, true, NOW(), NOW()
FROM (
  VALUES
    ('Restoran', 'restaurant', '🍽', 0),
    ('Oziq-ovqat', 'grocery', '🥬', 1),
    ('Gul do''konlari', 'flowers', '💐', 2),
    ('Parfyumeriya', 'perfume', '🧴', 3),
    ('Sovg''alar', 'gift', '🎁', 4),
    ('Dorixona', 'pharmacy', '💊', 5),
    ('Elektronika', 'electronics', '💻', 6)
) AS v(name, slug, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM "business_types" bt WHERE bt.slug = v.slug
);

-- Link existing restaurants to restaurant type
UPDATE "restaurants" r
SET "business_type_id" = bt.id
FROM "business_types" bt
WHERE bt.slug = 'restaurant' AND r."business_type_id" IS NULL;
