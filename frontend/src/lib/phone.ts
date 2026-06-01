/** Match backend normalizePhone for staff login by phone */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '').trim();
}
