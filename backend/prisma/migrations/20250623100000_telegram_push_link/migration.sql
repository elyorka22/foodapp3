-- Telegram push linking: pairing codes + bot conversation state
CREATE TABLE "business_telegram_link_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "linked_chat_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_telegram_link_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "business_telegram_link_codes_business_id_expires_at_idx"
    ON "business_telegram_link_codes"("business_id", "expires_at");
CREATE INDEX "business_telegram_link_codes_code_idx"
    ON "business_telegram_link_codes"("code");

ALTER TABLE "business_telegram_link_codes"
    ADD CONSTRAINT "business_telegram_link_codes_business_id_fkey"
    FOREIGN KEY ("business_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "telegram_bot_conversations" (
    "telegram_id" BIGINT NOT NULL,
    "step" TEXT NOT NULL,
    "business_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_bot_conversations_pkey" PRIMARY KEY ("telegram_id")
);
