-- Default shared store categories per marketplace type (grocery dairy/meat, …).
-- Requires business_type_id column from 20261109120000_type_scoped_product_categories.

INSERT INTO "categories" (
  "id", "business_type_id", "restaurant_id", "name", "slug",
  "sort_order", "is_active", "created_at", "updated_at"
)
SELECT gen_random_uuid(), bt.id, NULL, v.name, v.slug, v.sort_order, true, NOW(), NOW()
FROM "business_types" bt
JOIN (
  VALUES
    ('grocery', 'Sut mahsulotlari', 'dairy', 0),
    ('grocery', 'Go''sht', 'meat', 1),
    ('grocery', 'Meva-sabzavot', 'produce', 2),
    ('grocery', 'Non', 'bread', 3),
    ('grocery', 'Ichimliklar', 'drinks', 4),
    ('grocery', 'Bakaleya', 'pantry', 5),
    ('grocery', 'Muzlatilgan', 'frozen', 6),
    ('flowers', 'Buketlar', 'bouquets', 0),
    ('flowers', 'Gul donalari', 'stems', 1),
    ('flowers', 'Xona o''simliklari', 'plants', 2),
    ('perfume', 'Atirlar', 'fragrance', 0),
    ('perfume', 'Parvarish', 'skincare', 1),
    ('perfume', 'Makiyaj', 'makeup', 2),
    ('pharmacy', 'Dori-darmon', 'medicine', 0),
    ('pharmacy', 'Vitaminlar', 'vitamins', 1),
    ('pharmacy', 'Gigiyena', 'hygiene', 2)
) AS v(type_slug, name, slug, sort_order)
  ON bt.slug = v.type_slug
WHERE bt.deleted_at IS NULL
ON CONFLICT ("business_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "is_active" = true,
  "deleted_at" = NULL,
  "updated_at" = NOW();
