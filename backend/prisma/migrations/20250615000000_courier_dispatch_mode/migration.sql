-- Courier dispatch: restaurant "call courier" + admin auto/manager mode
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "courier_requested_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "orders_courier_requested_at_idx" ON "orders"("courier_requested_at");
