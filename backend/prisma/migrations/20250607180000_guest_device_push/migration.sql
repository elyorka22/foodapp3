-- Guest/anonymous push devices + order device linking

ALTER TABLE "user_devices" DROP CONSTRAINT IF EXISTS "user_devices_user_id_account_type_device_id_key";

ALTER TABLE "user_devices" ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "phone" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "user_devices_device_id_account_type_key"
  ON "user_devices"("device_id", "account_type");

CREATE INDEX IF NOT EXISTS "user_devices_phone_idx" ON "user_devices"("phone");

CREATE INDEX IF NOT EXISTS "user_devices_push_token_idx" ON "user_devices"("push_token");

ALTER TABLE "guest_orders" ADD COLUMN IF NOT EXISTS "device_id" TEXT;

CREATE INDEX IF NOT EXISTS "guest_orders_device_id_idx" ON "guest_orders"("device_id");
