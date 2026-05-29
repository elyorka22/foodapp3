-- CreateEnum
CREATE TYPE "PromoCodeType" AS ENUM ('FIXED', 'PERCENTAGE');
CREATE TYPE "LoyaltyLevel" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN "referral_code" TEXT;
CREATE UNIQUE INDEX "customers_referral_code_key" ON "customers"("referral_code");

ALTER TABLE "orders" ADD COLUMN "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "promo_code_id" UUID;

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PromoCodeType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minimum_order_amount" DECIMAL(10,2),
    "maximum_discount" DECIMAL(10,2),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "promo_code_usages" (
    "id" UUID NOT NULL,
    "promo_code_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "customer_id" UUID,
    "discount_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "promo_code_usages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "restaurant_working_hours" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "restaurant_working_hours_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "restaurant_holidays" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "restaurant_holidays_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_loyalty" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" "LoyaltyLevel" NOT NULL DEFAULT 'BRONZE',
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customer_loyalty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "referrals" (
    "id" UUID NOT NULL,
    "inviter_customer_id" UUID NOT NULL,
    "invited_customer_id" UUID NOT NULL,
    "reward_points" INTEGER NOT NULL DEFAULT 0,
    "rewarded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");
CREATE INDEX "promo_codes_is_active_idx" ON "promo_codes"("is_active");
CREATE UNIQUE INDEX "promo_code_usages_order_id_key" ON "promo_code_usages"("order_id");
CREATE INDEX "promo_code_usages_promo_code_id_idx" ON "promo_code_usages"("promo_code_id");
CREATE INDEX "promo_code_usages_customer_id_idx" ON "promo_code_usages"("customer_id");
CREATE UNIQUE INDEX "restaurant_working_hours_restaurant_id_day_of_week_key" ON "restaurant_working_hours"("restaurant_id", "day_of_week");
CREATE UNIQUE INDEX "restaurant_holidays_restaurant_id_date_key" ON "restaurant_holidays"("restaurant_id", "date");
CREATE UNIQUE INDEX "customer_loyalty_customer_id_key" ON "customer_loyalty"("customer_id");
CREATE UNIQUE INDEX "referrals_invited_customer_id_key" ON "referrals"("invited_customer_id");
CREATE INDEX "referrals_inviter_customer_id_idx" ON "referrals"("inviter_customer_id");
CREATE INDEX "orders_promo_code_id_idx" ON "orders"("promo_code_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "restaurant_working_hours" ADD CONSTRAINT "restaurant_working_hours_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "restaurant_holidays" ADD CONSTRAINT "restaurant_holidays_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_loyalty" ADD CONSTRAINT "customer_loyalty_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_inviter_customer_id_fkey" FOREIGN KEY ("inviter_customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_invited_customer_id_fkey" FOREIGN KEY ("invited_customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
