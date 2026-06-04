-- CreateEnum
CREATE TYPE "BusinessKind" AS ENUM ('RESTAURANT', 'STORE');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "kind" "BusinessKind";

-- Classify existing rows
UPDATE "restaurants" b
SET "kind" = 'RESTAURANT'
FROM "business_types" t
WHERE b."business_type_id" = t."id" AND t."slug" = 'restaurant';

UPDATE "restaurants" SET "kind" = 'STORE' WHERE "kind" IS NULL;

ALTER TABLE "restaurants" ALTER COLUMN "kind" SET NOT NULL;
ALTER TABLE "restaurants" ALTER COLUMN "kind" SET DEFAULT 'STORE';

-- All merchants use catalog menu (no contact-only storefront)
UPDATE "business_types" SET "catalog_mode" = 'CATALOG';
