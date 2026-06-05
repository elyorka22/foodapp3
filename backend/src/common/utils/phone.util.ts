/** Canonical Uzbekistan mobile: +998XXXXXXXXX (9 digits after 998). */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[\s\-()+]/g, '').trim();
  if (!digits) return phone.trim();

  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }

  // Local trunk prefix: 8901234567 -> 998901234567
  if (digits.length === 10 && digits.startsWith('8')) {
    digits = `998${digits.slice(1)}`;
  }

  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`;
  }

  if (/^\d{9}$/.test(digits)) {
    return `+998${digits}`;
  }

  if (digits.startsWith('998')) {
    return `+${digits}`;
  }

  const legacy = phone.replace(/[\s\-()]/g, '').trim();
  return legacy.startsWith('+') ? legacy : `+${digits}`;
}

/** Match stored phone values created before canonical normalization. */
export function phoneLookupValues(phone: string): string[] {
  const canonical = normalizePhone(phone);
  const values = new Set<string>([canonical, phone.replace(/[\s\-()]/g, '').trim()]);

  if (canonical.startsWith('+998') && canonical.length === 13) {
    values.add(canonical.slice(1));
    values.add(canonical.slice(4));
  }

  return [...values];
}
