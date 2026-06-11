/** Canonical Uzbekistan mobile: +998XXXXXXXXX (9 digits after 998). */
export const UZ_PHONE_PREFIX = '+998';

/** Local digits only (max 9), stripping country / trunk prefixes. */
export function extractUzLocalDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  } else if (digits.length === 10 && digits.startsWith('8')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 9);
}

/** Display grouping for the 9-digit local part. */
export function formatUzLocalDigits(digits: string): string {
  const d = extractUzLocalDigits(digits);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
}

export function toUzPhone(localDigits: string): string {
  const d = extractUzLocalDigits(localDigits);
  return d ? `${UZ_PHONE_PREFIX}${d}` : '';
}

export function isValidUzPhone(phone: string): boolean {
  return /^\+998\d{9}$/.test(normalizePhone(phone));
}

/** Match backend normalizePhone for staff login by phone */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[\s\-()+]/g, '').trim();
  if (!digits) return phone.trim();

  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }

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
