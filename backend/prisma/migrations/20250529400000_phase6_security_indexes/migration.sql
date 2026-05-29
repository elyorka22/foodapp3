-- Analytics: delivered orders by restaurant and date
CREATE INDEX IF NOT EXISTS "orders_restaurant_status_delivered_idx"
  ON "orders" ("restaurant_id", "status", "delivered_at")
  WHERE "deleted_at" IS NULL;

-- Guest order lookups for customer stats
CREATE INDEX IF NOT EXISTS "guest_orders_customer_phone_idx"
  ON "guest_orders" ("customer_id", "phone");
