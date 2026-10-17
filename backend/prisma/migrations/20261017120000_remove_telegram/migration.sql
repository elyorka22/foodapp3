-- Drop Telegram bot / push tables
DROP TABLE IF EXISTS "business_telegram_link_codes";
DROP TABLE IF EXISTS "telegram_bot_conversations";
DROP TABLE IF EXISTS "telegram_bot_subscribers";

-- Business: remove order-notification chat id
ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "telegram_order_chat_id";

-- Customers: remove Telegram auth fields
DROP INDEX IF EXISTS "customers_telegram_id_key";
DROP INDEX IF EXISTS "customers_telegram_username_idx";

ALTER TABLE "customers" DROP COLUMN IF EXISTS "telegram_id";
ALTER TABLE "customers" DROP COLUMN IF EXISTS "telegram_username";
ALTER TABLE "customers" DROP COLUMN IF EXISTS "telegram_first_name";
ALTER TABLE "customers" DROP COLUMN IF EXISTS "telegram_last_name";
ALTER TABLE "customers" DROP COLUMN IF EXISTS "telegram_photo_url";
ALTER TABLE "customers" DROP COLUMN IF EXISTS "is_telegram_verified";
ALTER TABLE "customers" DROP COLUMN IF EXISTS "last_telegram_login_at";

-- Remove TELEGRAM from CustomerAuthProvider enum (Postgres)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'CustomerAuthProvider' AND e.enumlabel = 'TELEGRAM'
  ) THEN
    UPDATE "customers"
    SET "auth_provider" = 'LOCAL'
    WHERE "auth_provider"::text = 'TELEGRAM';

    ALTER TYPE "CustomerAuthProvider" RENAME TO "CustomerAuthProvider_old";
    CREATE TYPE "CustomerAuthProvider" AS ENUM ('PHONE', 'LOCAL', 'GOOGLE');
    ALTER TABLE "customers"
      ALTER COLUMN "auth_provider" TYPE "CustomerAuthProvider"
      USING ("auth_provider"::text::"CustomerAuthProvider");
    DROP TYPE "CustomerAuthProvider_old";
  END IF;
END $$;
