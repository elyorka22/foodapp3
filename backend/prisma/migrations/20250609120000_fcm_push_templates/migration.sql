-- Push notification templates for courier accept and assignment changes

INSERT INTO "notification_templates" ("id", "code", "title", "body", "type") VALUES
  (gen_random_uuid(), 'COURIER_ACCEPTED', 'Kuryer qabul qildi', 'Kuryer buyurtmangizni qabul qildi.', 'ORDER_ACCEPTED'),
  (gen_random_uuid(), 'COURIER_UNASSIGNED', 'Biriktirish bekor qilindi', 'Buyurtma {{orderNumber}} sizdan olib tashlandi.', 'ORDER_ASSIGNED')
ON CONFLICT ("code") DO NOTHING;
