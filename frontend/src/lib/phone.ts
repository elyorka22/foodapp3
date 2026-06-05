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
