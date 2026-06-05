-- Freeze restaurant/customer coordinates on each order for billing audit.
ALTER TABLE "orders" ADD COLUMN "restaurant_latitude" DECIMAL(10,7);
ALTER TABLE "orders" ADD COLUMN "restaurant_longitude" DECIMAL(10,7);
ALTER TABLE "orders" ADD COLUMN "customer_latitude" DECIMAL(10,7);
ALTER TABLE "orders" ADD COLUMN "customer_longitude" DECIMAL(10,7);
