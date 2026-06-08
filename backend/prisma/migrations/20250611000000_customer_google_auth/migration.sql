-- Google Sign-In for customers (Firebase Authentication).

ALTER TYPE "CustomerAuthProvider" ADD VALUE IF NOT EXISTS 'LOCAL';
ALTER TYPE "CustomerAuthProvider" ADD VALUE IF NOT EXISTS 'GOOGLE';

UPDATE "customers" SET "auth_provider" = 'LOCAL' WHERE "auth_provider" = 'PHONE';

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "google_photo_url" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "is_google_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "last_google_login_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_google_id_key" ON "customers"("google_id");
