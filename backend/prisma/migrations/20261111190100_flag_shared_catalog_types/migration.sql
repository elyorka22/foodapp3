-- Use SHARED_CATALOG after enum value is committed (previous migration).
UPDATE "business_types"
SET "menu_mode" = 'SHARED_CATALOG'
WHERE "slug" IN ('grocery', 'perfume', 'pharmacy')
  AND "deleted_at" IS NULL;
