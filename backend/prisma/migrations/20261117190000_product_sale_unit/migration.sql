-- CreateEnum
CREATE TYPE "ProductSaleUnit" AS ENUM ('dona', 'gr', 'kg', 'karobka');

-- AlterTable
ALTER TABLE "products" ADD COLUMN "sale_unit" "ProductSaleUnit" NOT NULL DEFAULT 'dona';
