/** Parse and normalize restaurant working hours (24h storage, 12h display). */

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

export function parseTimeToMinutes(time: string): number {
  const normalized = normalizeTimeTo24h(time);
  if (!normalized) {
    const [h, m] = time.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
    return NaN;
  }
  const [h, m] = normalized.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime12h(time24: string): string {
  const normalized = normalizeTimeTo24h(time24) ?? time24;
  const minutes = parseTimeToMinutes(normalized);
  if (!Number.isFinite(minutes)) return time24;

  const h24 = Math.floor(minutes / 60) % 24;
  const min = minutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(min).padStart(2, '0')} ${period}`;
}

export function normalizeWorkingHourTime(time: string, fallback: string): string {
  return normalizeTimeTo24h(time) ?? normalizeTimeTo24h(fallback) ?? fallback;
}

export function minutesToTime24(totalMinutes: number): string {
  const minutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * DB: closeTime = closed-from, openTime = closed-until (work resumes).
 * Fixes swapped same-day morning blocks (e.g. 08:00–01:00 → 01:00–08:00).
 */
export function normalizeNonWorkingPeriodTimes(
  closeTime: string,
  openTime: string,
): { closeTime: string; openTime: string } {
  const close24 = normalizeTimeTo24h(closeTime);
  const open24 = normalizeTimeTo24h(openTime);
  if (!close24 || !open24) {
    return { closeTime: close24 ?? closeTime, openTime: open24 ?? openTime };
  }

  let closedFrom = parseTimeToMinutes(close24);
  let closedUntil = parseTimeToMinutes(open24);
  if (!Number.isFinite(closedFrom) || !Number.isFinite(closedUntil)) {
    return { closeTime: close24, openTime: open24 };
  }

  if (closedFrom > closedUntil && closedUntil < 12 * 60 && closedFrom <= 12 * 60) {
    [closedFrom, closedUntil] = [closedUntil, closedFrom];
    return {
      closeTime: minutesToTime24(closedFrom),
      openTime: minutesToTime24(closedUntil),
    };
  }

  return { closeTime: close24, openTime: open24 };
}
