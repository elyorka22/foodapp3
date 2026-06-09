-- Restaurants created via admin without business_type_id were stored as STORE.
-- They must be RESTAURANT so menu items use global dish categories.
UPDATE "restaurants"
SET "kind" = 'RESTAURANT'
WHERE "business_type_id" IS NULL AND "kind" = 'STORE';

UPDATE "restaurants" b
SET "kind" = 'RESTAURANT'
FROM "business_types" t
WHERE b."business_type_id" = t."id"
  AND t."slug" = 'restaurant'
  AND b."kind" = 'STORE';
