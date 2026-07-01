/** Visible button labels (also matched if user taps reply-keyboard text). */
export const TG_BTN_OPEN_SITE = "🌐 Saytga o'tish";
export const TG_BTN_PARTNERSHIP = '🤝 Hamkorlik';
export const TG_BTN_CHAT_ID = '🆔 Chat ID';
export const TG_BTN_HELP = 'ℹ️ Yordam';
export const TG_BTN_PUSH_SETUP = '🔔 Push sozlash';
export const TG_BTN_HIDE_MENU = '⬇️ Menyuni yashirish';

export const TG_CALLBACK_CHAT_ID = 'chat_id';
export const TG_CALLBACK_HELP = 'help';
export const TG_CALLBACK_PUSH_SETUP = 'push_setup';

export const HAMKORLIK_PATH = '/hamkorlik';

export function buildPartnershipUrl(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '');
  return `${base}${HAMKORLIK_PATH}`;
}

export function buildMainInlineKeyboard(siteUrl: string) {
  return {
    inline_keyboard: [
      [{ text: TG_BTN_OPEN_SITE, url: siteUrl }],
      [{ text: TG_BTN_PARTNERSHIP, url: buildPartnershipUrl(siteUrl) }],
      [
        { text: TG_BTN_CHAT_ID, callback_data: TG_CALLBACK_CHAT_ID },
        { text: TG_BTN_HELP, callback_data: TG_CALLBACK_HELP },
      ],
      [{ text: TG_BTN_PUSH_SETUP, callback_data: TG_CALLBACK_PUSH_SETUP }],
    ],
  };
}

/** Bottom reply keyboard — not persistent so Telegram lets users collapse it. */
export function buildMainReplyKeyboard() {
  return {
    keyboard: [
      [{ text: TG_BTN_OPEN_SITE }],
      [{ text: TG_BTN_PARTNERSHIP }],
      [{ text: TG_BTN_PUSH_SETUP }],
      [
        { text: TG_BTN_CHAT_ID },
        { text: TG_BTN_HELP },
      ],
      [{ text: TG_BTN_HIDE_MENU }],
    ],
    resize_keyboard: true,
  };
}

export function buildRemoveReplyKeyboard() {
  return { remove_keyboard: true };
}
