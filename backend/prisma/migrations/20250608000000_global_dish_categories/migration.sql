-- Global dish categories (admin-managed taxonomy for menu items across all merchants).

CREATE TABLE "dish_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "image_url" TEXT,
    "image_scale" INTEGER NOT NULL DEFAULT 100,
    "image_position_x" INTEGER NOT NULL DEFAULT 50,
    "image_position_y" INTEGER NOT NULL DEFAULT 50,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "dish_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dish_categories_slug_key" ON "dish_categories"("slug");
CREATE INDEX "dish_categories_is_active_sort_order_idx" ON "dish_categories"("is_active", "sort_order");

ALTER TABLE "products" ADD COLUMN "dish_category_id" UUID;
CREATE INDEX "products_dish_category_id_idx" ON "products"("dish_category_id");
ALTER TABLE "products" ADD CONSTRAINT "products_dish_category_id_fkey"
    FOREIGN KEY ("dish_category_id") REFERENCES "dish_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate distinct legacy per-merchant categories into global dish categories.
INSERT INTO "dish_categories" (
    "id", "name", "slug", "description", "icon", "image_url", "sort_order", "is_active", "updated_at"
)
SELECT DISTINCT ON (slug)
    gen_random_uuid(),
    name,
    slug,
    description,
    icon,
    image_url,
    sort_order,
    is_active,
    NOW()
FROM "categories"
WHERE "deleted_at" IS NULL
ORDER BY slug, "created_at" ASC;

UPDATE "products" p
SET "dish_category_id" = dc."id"
FROM "categories" c
JOIN "dish_categories" dc ON dc."slug" = c."slug"
WHERE p."category_id" = c."id"
  AND p."dish_category_id" IS NULL;
