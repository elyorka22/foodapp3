-- Type-scoped store categories: shared catalog per BusinessType.
-- Legacy per-store rows keep restaurant_id; new rows use business_type_id.

ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "business_type_id" UUID;

ALTER TABLE "categories" ALTER COLUMN "restaurant_id" DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_business_type_id_fkey'
  ) THEN
    ALTER TABLE "categories"
      ADD CONSTRAINT "categories_business_type_id_fkey"
      FOREIGN KEY ("business_type_id") REFERENCES "business_types"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "categories_business_type_id_slug_key"
  ON "categories" ("business_type_id", "slug");

CREATE INDEX IF NOT EXISTS "categories_business_type_id_is_active_idx"
  ON "categories" ("business_type_id", "is_active");
