-- FoodApp notification system (templates, history, devices, preferences)

CREATE TYPE "NotificationChannelCode" AS ENUM (
  'ORDER_CREATED',
  'ORDER_ACCEPTED',
  'ORDER_PREPARING',
  'ORDER_READY',
  'ORDER_DELIVERING',
  'ORDER_COMPLETED',
  'ORDER_CANCELLED',
  'PROMOTION',
  'SYSTEM',
  'NEW_ORDER',
  'ORDER_ASSIGNED',
  'ORDER_PROBLEM',
  'DAILY_REPORT'
);

CREATE TYPE "NotificationAccountType" AS ENUM ('CUSTOMER', 'STAFF');

CREATE TYPE "DevicePlatform" AS ENUM ('android', 'ios', 'web');

DROP TABLE IF EXISTS "notifications";

DROP TYPE IF EXISTS "NotificationType";

CREATE TABLE "notification_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "type" "NotificationChannelCode" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_templates_code_key" ON "notification_templates"("code");

CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "account_type" "NotificationAccountType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "type" "NotificationChannelCode" NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_account_type_is_read_idx" ON "notifications"("user_id", "account_type", "is_read");
CREATE INDEX "notifications_user_id_account_type_created_at_idx" ON "notifications"("user_id", "account_type", "created_at" DESC);

CREATE TABLE "user_devices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "account_type" "NotificationAccountType" NOT NULL,
  "device_id" TEXT NOT NULL,
  "push_token" TEXT,
  "platform" "DevicePlatform" NOT NULL,
  "app_version" TEXT,
  "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_devices_user_id_account_type_device_id_key" ON "user_devices"("user_id", "account_type", "device_id");
CREATE INDEX "user_devices_user_id_account_type_idx" ON "user_devices"("user_id", "account_type");

CREATE TABLE "notification_preferences" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "account_type" "NotificationAccountType" NOT NULL,
  "type" "NotificationChannelCode" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "push_enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_preferences_user_id_account_type_type_key" ON "notification_preferences"("user_id", "account_type", "type");

INSERT INTO "notification_templates" ("id", "code", "title", "body", "type") VALUES
  (gen_random_uuid(), 'ORDER_CREATED', 'Buyurtma qabul qilindi', 'Buyurtmangiz qabul qilindi va tez orada ko''rib chiqiladi.', 'ORDER_CREATED'),
  (gen_random_uuid(), 'ORDER_ACCEPTED', 'Buyurtma tasdiqlandi', 'Restoran buyurtmangizni qabul qildi.', 'ORDER_ACCEPTED'),
  (gen_random_uuid(), 'ORDER_PREPARING', 'Tayyorlanmoqda', 'Buyurtmangiz tayyorlanmoqda.', 'ORDER_PREPARING'),
  (gen_random_uuid(), 'ORDER_READY', 'Buyurtma tayyor', 'Buyurtmangiz yetkazish uchun tayyor.', 'ORDER_READY'),
  (gen_random_uuid(), 'ORDER_DELIVERING', 'Yo''lda', 'Kuryer yo''lga chiqdi.', 'ORDER_DELIVERING'),
  (gen_random_uuid(), 'ORDER_COMPLETED', 'Yetkazildi', 'Buyurtma muvaffaqiyatli yetkazildi.', 'ORDER_COMPLETED'),
  (gen_random_uuid(), 'ORDER_CANCELLED', 'Bekor qilindi', 'Buyurtmangiz bekor qilindi.', 'ORDER_CANCELLED'),
  (gen_random_uuid(), 'PROMOTION', 'Aksiya', 'Siz uchun maxsus taklif!', 'PROMOTION'),
  (gen_random_uuid(), 'SYSTEM', 'Xabar', 'FoodApp dan muhim xabar.', 'SYSTEM'),
  (gen_random_uuid(), 'NEW_ORDER', 'Yangi buyurtma', 'Yangi buyurtma keldi.', 'NEW_ORDER'),
  (gen_random_uuid(), 'ORDER_ASSIGNED', 'Buyurtma biriktirildi', 'Sizga yangi buyurtma biriktirildi.', 'ORDER_ASSIGNED'),
  (gen_random_uuid(), 'ORDER_PROBLEM', 'Muammo', 'Buyurtmada muammo aniqlandi.', 'ORDER_PROBLEM'),
  (gen_random_uuid(), 'DAILY_REPORT', 'Kunlik hisobot', 'Kunlik hisobot tayyor.', 'DAILY_REPORT');
