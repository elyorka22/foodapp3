/** Parse and normalize working hours (24h storage, 12h display). */

export function normalizeTimeTo24h(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const compact = trimmed.replace(/\s+/g, ' ');

  const withPeriod = /^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?\s*([Mm])\.?$/.exec(compact);
  if (withPeriod) {
    let hour = parseInt(withPeriod[1], 10);
    const minute = parseInt(withPeriod[2] ?? '0', 10);
    const isPm = withPeriod[3].toLowerCase() === 'p';
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    if (hour === 12) hour = isPm ? 12 : 0;
    else if (isPm) hour += 12;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  const twentyFour = /^(\d{1,2}):(\d{2})$/.exec(compact);
  if (twentyFour && !/[AaPp]/.test(compact)) {
    const hour = parseInt(twentyFour[1], 10);
    const minute = parseInt(twentyFour[2], 10);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  return null;
}

export function formatTime12h(time24: string): string {
  const normalized = normalizeTimeTo24h(time24) ?? time24;
  const match = /^(\d{1,2}):(\d{2})$/.exec(normalized);
  if (!match) return time24;

  const h24 = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(min).padStart(2, '0')} ${period}`;
}

export function time24ToInputValue(time24: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  const normalized = normalizeTimeTo24h(time24) ?? '09:00';
  const [hStr, mStr] = normalized.split(':');
  const h24 = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const hour = h24 % 12 || 12;
  return { hour, minute, period };
}

export function inputValueToTime24(hour: number, minute: number, period: 'AM' | 'PM'): string {
  const raw = `${hour}:${String(minute).padStart(2, '0')} ${period}`;
  return normalizeTimeTo24h(raw) ?? '09:00';
}
