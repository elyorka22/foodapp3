import {
  formatTime12h,
  normalizeTimeTo24h,
  normalizeWorkingHourTime,
  parseTimeToMinutes,
} from './time-format.util';

export type WorkingHourRow = {
  dayOfWeek: number;
  /** End of daily non-working period (when work resumes). Stored as openTime in DB. */
  openTime: string;
  /** Start of daily non-working period (when work pauses). Stored as closeTime in DB. */
  closeTime: string;
  isClosed: boolean;
};

export type RestaurantAvailability = {
  isOpen: boolean;
  closesAt: string | null;
  closingSoon: boolean;
  minutesUntilClose: number | null;
};

export { formatTime12h, normalizeTimeTo24h, normalizeWorkingHourTime, parseTimeToMinutes };

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getAppTimezone(): string {
  return process.env.APP_TIMEZONE?.trim() || 'Asia/Tashkent';
}

export function getLocalDateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getLocalDayAndMinutes(
  now: Date,
  timeZone: string,
): { dayOfWeek: number; currentMinutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
  const hour = parseInt(parts.find((part) => part.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((part) => part.type === 'minute')?.value ?? '0', 10);

  return {
    dayOfWeek: WEEKDAY_TO_INDEX[weekday] ?? 0,
    currentMinutes: hour * 60 + minute,
  };
}

/** Non-working block inside the day. DB: closeTime = from, openTime = until. */
export function closedPeriodFromSchedule(schedule: WorkingHourRow): {
  closedFrom: number;
  closedUntil: number;
} {
  return {
    closedFrom: parseTimeToMinutes(normalizeWorkingHourTime(schedule.closeTime, '01:00')),
    closedUntil: parseTimeToMinutes(normalizeWorkingHourTime(schedule.openTime, '09:00')),
  };
}

/** Restaurant is open at all times except the closed block. */
export function isOpenOutsideClosedPeriod(
  closedFrom: number,
  closedUntil: number,
  currentMinutes: number,
): boolean {
  if (!Number.isFinite(closedFrom) || !Number.isFinite(closedUntil)) return false;
  if (closedFrom === closedUntil) return true;

  if (closedFrom < closedUntil) {
    // e.g. closed 01:00 -> 09:00
    return !(currentMinutes >= closedFrom && currentMinutes < closedUntil);
  }

  // e.g. closed 22:00 -> 09:00 next morning
  return currentMinutes >= closedUntil && currentMinutes < closedFrom;
}

function minutesUntilClosedPeriod(
  closedFrom: number,
  closedUntil: number,
  currentMinutes: number,
): number | null {
  if (!isOpenOutsideClosedPeriod(closedFrom, closedUntil, currentMinutes)) return null;

  if (closedFrom < closedUntil) {
    if (currentMinutes < closedFrom) {
      return closedFrom - currentMinutes;
    }
    return 24 * 60 - currentMinutes + closedFrom;
  }

  return closedFrom - currentMinutes;
}

function scheduleForDay(workingHours: WorkingHourRow[], dayOfWeek: number) {
  const direct = workingHours.find((row) => row.dayOfWeek === dayOfWeek);
  if (direct) return direct;
  // Partial/legacy rows — reuse first active day template (same hours every day).
  return workingHours.find((row) => !row.isClosed);
}

function openFromSchedule(
  schedule: WorkingHourRow,
  currentMinutes: number,
): RestaurantAvailability | null {
  if (schedule.isClosed) return null;

  const { closedFrom, closedUntil } = closedPeriodFromSchedule(schedule);
  const untilClose = minutesUntilClosedPeriod(closedFrom, closedUntil, currentMinutes);

  if (untilClose == null) return null;

  return {
    isOpen: true,
    closesAt: formatTime12h(schedule.closeTime),
    closingSoon: untilClose > 0 && untilClose <= 60,
    minutesUntilClose: untilClose,
  };
}

export function resolveRestaurantAvailability(
  workingHours: WorkingHourRow[],
  holidays: { date: Date }[],
  now = new Date(),
  timeZone = getAppTimezone(),
): RestaurantAvailability {
  const todayKey = getLocalDateKey(now, timeZone);

  const isHoliday = holidays.some((holiday) => getLocalDateKey(holiday.date, timeZone) === todayKey);
  if (isHoliday) {
    return { isOpen: false, closesAt: null, closingSoon: false, minutesUntilClose: null };
  }

  if (!workingHours.length) {
    return { isOpen: true, closesAt: null, closingSoon: false, minutesUntilClose: null };
  }

  const { dayOfWeek, currentMinutes } = getLocalDayAndMinutes(now, timeZone);

  const todaySchedule = scheduleForDay(workingHours, dayOfWeek);
  const todayOpen = todaySchedule ? openFromSchedule(todaySchedule, currentMinutes) : null;
  if (todayOpen) return todayOpen;

  const closesAt = todaySchedule?.closeTime ? formatTime12h(todaySchedule.closeTime) : null;
  return {
    isOpen: false,
    closesAt,
    closingSoon: false,
    minutesUntilClose: null,
  };
}

/** @deprecated use resolveRestaurantAvailability().isOpen */
export function isRestaurantOpenNow(
  workingHours: WorkingHourRow[],
  holidays: { date: Date }[],
  now = new Date(),
): boolean {
  return resolveRestaurantAvailability(workingHours, holidays, now).isOpen;
}

/** @deprecated renamed — use isOpenOutsideClosedPeriod */
export function isWithinWorkingWindow(
  openMinutes: number,
  closeMinutes: number,
  currentMinutes: number,
): boolean {
  return isOpenOutsideClosedPeriod(closeMinutes, openMinutes, currentMinutes);
}
