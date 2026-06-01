-- Product category enrichment (menu categories per business)
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image_url" TEXT;

-- Future delivery providers (internal courier, taxi, third-party)
CREATE TYPE "DeliveryProviderType" AS ENUM ('INTERNAL', 'COURIER_NETWORK', 'TAXI', 'THIRD_PARTY');

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_provider_type" "DeliveryProviderType" NOT NULL DEFAULT 'INTERNAL';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "external_delivery_ref" TEXT;

CREATE INDEX IF NOT EXISTS "orders_delivery_provider_type_idx" ON "orders"("delivery_provider_type");
