-- Restaurant order notifications via Telegram + bot subscriber tracking
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "telegram_order_chat_id" TEXT;

CREATE TABLE IF NOT EXISTS "telegram_bot_subscribers" (
    "id" UUID NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "telegram_username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "first_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_bot_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "telegram_bot_subscribers_telegram_id_key" ON "telegram_bot_subscribers"("telegram_id");
CREATE INDEX IF NOT EXISTS "telegram_bot_subscribers_last_started_at_idx" ON "telegram_bot_subscribers"("last_started_at");
