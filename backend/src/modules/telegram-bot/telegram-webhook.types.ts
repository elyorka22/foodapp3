/** Telegram Bot API update payload (webhook). Not validated — Telegram sends many extra fields. */
export type TelegramWebhookChat = {
  id: number;
};

export type TelegramWebhookUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export type TelegramWebhookMessage = {
  message_id: number;
  chat: TelegramWebhookChat;
  from?: TelegramWebhookUser;
  text?: string;
};

export type TelegramWebhookCallbackQuery = {
  id: string;
  data?: string;
  from?: TelegramWebhookUser;
  message?: TelegramWebhookMessage;
};

export type TelegramWebhookUpdate = {
  update_id?: number;
  message?: TelegramWebhookMessage;
  callback_query?: TelegramWebhookCallbackQuery;
};
