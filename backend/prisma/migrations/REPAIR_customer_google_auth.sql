-- Manual production repair for failed 20250611000000_customer_google_auth.
-- Run each statement separately in psql (NOT inside a single BEGIN/COMMIT block).
-- Safe to re-run: idempotent, preserves existing customer rows.

-- 1) Enum values (no-op if already present)
ALTER TYPE "CustomerAuthProvider" ADD VALUE IF NOT EXISTS 'LOCAL';
ALTER TYPE "CustomerAuthProvider" ADD VALUE IF NOT EXISTS 'GOOGLE';

-- 2) Rename PHONE -> LOCAL for existing customers only
UPDATE "customers" SET "auth_provider" = 'LOCAL' WHERE "auth_provider" = 'PHONE';

-- 3) Google profile columns
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "google_photo_url" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "is_google_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "last_google_login_at" TIMESTAMP(3);

-- 4) Unique index on google_id
CREATE UNIQUE INDEX IF NOT EXISTS "customers_google_id_key" ON "customers"("google_id");
