-- Customer Telegram authentication fields

CREATE TYPE "CustomerAuthProvider" AS ENUM ('TELEGRAM', 'PHONE');

ALTER TABLE "customers" ALTER COLUMN "phone" DROP NOT NULL;

ALTER TABLE "customers" ADD COLUMN "telegram_id" BIGINT;
ALTER TABLE "customers" ADD COLUMN "telegram_username" TEXT;
ALTER TABLE "customers" ADD COLUMN "telegram_first_name" TEXT;
ALTER TABLE "customers" ADD COLUMN "telegram_last_name" TEXT;
ALTER TABLE "customers" ADD COLUMN "telegram_photo_url" TEXT;
ALTER TABLE "customers" ADD COLUMN "auth_provider" "CustomerAuthProvider";
ALTER TABLE "customers" ADD COLUMN "is_telegram_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "customers" ADD COLUMN "last_telegram_login_at" TIMESTAMP(3);
ALTER TABLE "customers" ADD COLUMN "default_delivery_address" TEXT;
ALTER TABLE "customers" ADD COLUMN "default_latitude" DECIMAL(10,7);
ALTER TABLE "customers" ADD COLUMN "default_longitude" DECIMAL(10,7);

CREATE UNIQUE INDEX "customers_telegram_id_key" ON "customers"("telegram_id");
CREATE INDEX "customers_telegram_username_idx" ON "customers"("telegram_username");

-- Backfill auth provider for existing phone-only customers
UPDATE "customers" SET "auth_provider" = 'PHONE' WHERE "phone" IS NOT NULL AND "auth_provider" IS NULL;
