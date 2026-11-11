-- Shared catalog products + per-store offers for SHARED_CATALOG verticals.

-- Add SHARED_CATALOG to BusinessMenuMode
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BusinessMenuMode' AND e.enumlabel = 'SHARED_CATALOG'
  ) THEN
    ALTER TYPE "BusinessMenuMode" ADD VALUE 'SHARED_CATALOG';
  END IF;
END $$;

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "business_type_id" UUID;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "default_price" DECIMAL(10, 2);

ALTER TABLE "products" ALTER COLUMN "restaurant_id" DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_business_type_id_fkey'
  ) THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_business_type_id_fkey"
      FOREIGN KEY ("business_type_id") REFERENCES "business_types"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "products_business_type_id_slug_key"
  ON "products" ("business_type_id", "slug");

CREATE INDEX IF NOT EXISTS "products_business_type_id_is_available_idx"
  ON "products" ("business_type_id", "is_available");

CREATE TABLE IF NOT EXISTS "business_product_offers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "price" DECIMAL(10, 2),
  "compare_price" DECIMAL(10, 2),
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "is_listed" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),

  CONSTRAINT "business_product_offers_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_product_offers_restaurant_id_fkey'
  ) THEN
    ALTER TABLE "business_product_offers"
      ADD CONSTRAINT "business_product_offers_restaurant_id_fkey"
      FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_product_offers_product_id_fkey'
  ) THEN
    ALTER TABLE "business_product_offers"
      ADD CONSTRAINT "business_product_offers_product_id_fkey"
      FOREIGN KEY ("product_id") REFERENCES "products"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "business_product_offers_restaurant_id_product_id_key"
  ON "business_product_offers" ("restaurant_id", "product_id");

CREATE INDEX IF NOT EXISTS "business_product_offers_restaurant_id_is_listed_is_available_idx"
  ON "business_product_offers" ("restaurant_id", "is_listed", "is_available");

CREATE INDEX IF NOT EXISTS "business_product_offers_product_id_idx"
  ON "business_product_offers" ("product_id");
