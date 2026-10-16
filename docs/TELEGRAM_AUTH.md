# Telegram (messaging only)

Customer **registration / login via Telegram Login Widget was removed**.

Customers sign in with phone or Google.

## What remains

- Order-notification bot (`TELEGRAM_BOT_TOKEN`, webhook, `Business.telegramOrderChatId`)
- Admin / business Telegram settings for linking restaurant chats
- Support / social `t.me` links in app settings

See `backend/src/modules/telegram-bot/` for the bot API.

## Env

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot API (notifications / webhook) |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook path secret |
| `API_PUBLIC_URL` | Public API base for webhook registration |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Optional — show bot username in merchant linking UI (not for customer login) |
