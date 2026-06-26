-- Customer order notifications: only accept/cancel, courier pickup, thank-you after delivery.
UPDATE "notification_templates"
SET
  "title" = 'Buyurtmangiz qabul qilindi',
  "body" = 'Restoran buyurtmangizni qabul qildi.'
WHERE "code" = 'ORDER_ACCEPTED';

UPDATE "notification_templates"
SET
  "title" = 'Buyurtmangiz bekor qilindi',
  "body" = 'Buyurtmangiz bekor qilindi.'
WHERE "code" = 'ORDER_CANCELLED';

UPDATE "notification_templates"
SET
  "title" = 'Kuryer buyurtmangizni oldi',
  "body" = 'Kuryer restorandan buyurtmangizni oldi.'
WHERE "code" = 'ORDER_DELIVERING';

UPDATE "notification_templates"
SET
  "title" = 'Rahmat!',
  "body" = 'Bizni tanlaganingiz uchun rahmat!'
WHERE "code" = 'ORDER_COMPLETED';
