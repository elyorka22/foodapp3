-- Remove recoverable plaintext password copies from users.
-- Do not store passwords in plaintext; authentication uses password_hash only.
ALTER TABLE "users" DROP COLUMN IF EXISTS "admin_password_note";
