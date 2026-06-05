-- Order lifecycle: courier arrived at restaurant
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'ARRIVED_AT_RESTAURANT';

-- Admin dashboard notification types
ALTER TYPE "AdminNotificationType" ADD VALUE IF NOT EXISTS 'COURIER_DECLINED';
ALTER TYPE "AdminNotificationType" ADD VALUE IF NOT EXISTS 'ORDER_DELIVERED';

-- Courier location history (foundation for live tracking)
CREATE TABLE IF NOT EXISTS "courier_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courier_id" UUID NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_locations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "courier_locations_courier_id_idx" ON "courier_locations"("courier_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courier_locations_courier_id_fkey'
  ) THEN
    ALTER TABLE "courier_locations"
      ADD CONSTRAINT "courier_locations_courier_id_fkey"
      FOREIGN KEY ("courier_id") REFERENCES "couriers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
