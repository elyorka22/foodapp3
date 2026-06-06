-- Add device role for FCM targeting (CUSTOMER / COURIER / STAFF)
CREATE TYPE "DeviceRole" AS ENUM ('CUSTOMER', 'COURIER', 'STAFF');

ALTER TABLE "user_devices" ADD COLUMN "role" "DeviceRole";

UPDATE "user_devices" SET "role" = 'CUSTOMER' WHERE "account_type" = 'CUSTOMER';
UPDATE "user_devices" SET "role" = 'STAFF' WHERE "account_type" = 'STAFF';

ALTER TABLE "user_devices" ALTER COLUMN "role" SET NOT NULL;

CREATE INDEX "user_devices_user_id_role_idx" ON "user_devices"("user_id", "role");
