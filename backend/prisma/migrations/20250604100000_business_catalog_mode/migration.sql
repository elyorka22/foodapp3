-- CATALOG = menu + cart; CONTACT = logo + phone only (grocery, pharmacy)
CREATE TYPE "BusinessCatalogMode" AS ENUM ('CATALOG', 'CONTACT');

ALTER TABLE "business_types" ADD COLUMN "catalog_mode" "BusinessCatalogMode" NOT NULL DEFAULT 'CATALOG';

UPDATE "business_types" SET "catalog_mode" = 'CONTACT' WHERE "slug" IN ('grocery', 'pharmacy');
