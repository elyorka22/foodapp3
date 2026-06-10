export function normalizeTelegramUrl(raw?: string | null): string {
  const value = raw?.trim() ?? '';
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('t.me/')) return `https://${value}`;
  const handle = value.startsWith('@') ? value.slice(1) : value;
  return `https://t.me/${handle}`;
}

export function telegramDisplayLabel(raw?: string | null): string {
  const value = raw?.trim() ?? '';
  if (!value) return '';
  if (value.startsWith('@')) return value;
  if (/^https?:\/\//i.test(value)) {
    const match = value.match(/t\.me\/([^/?#]+)/i);
    if (match?.[1]) return `@${match[1]}`;
  }
  return value.startsWith('@') ? value : `@${value}`;
}
