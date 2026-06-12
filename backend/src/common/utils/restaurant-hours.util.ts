export type WorkingHourRow = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type RestaurantAvailability = {
  isOpen: boolean;
  closesAt: string | null;
  closingSoon: boolean;
  minutesUntilClose: number | null;
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function resolveRestaurantAvailability(
  workingHours: WorkingHourRow[],
  holidays: { date: Date }[],
  now = new Date(),
): RestaurantAvailability {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const isHoliday = holidays.some((h) => {
    const d = new Date(h.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  if (isHoliday) {
    return { isOpen: false, closesAt: null, closingSoon: false, minutesUntilClose: null };
  }

  if (!workingHours.length) {
    return { isOpen: true, closesAt: null, closingSoon: false, minutesUntilClose: null };
  }

  const day = now.getDay();
  const schedule = workingHours.find((w) => w.dayOfWeek === day);
  if (!schedule || schedule.isClosed) {
    return {
      isOpen: false,
      closesAt: schedule?.closeTime ?? null,
      closingSoon: false,
      minutesUntilClose: null,
    };
  }

  const openMinutes = parseTimeToMinutes(schedule.openTime);
  const closeMinutes = parseTimeToMinutes(schedule.closeTime);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let isOpen: boolean;
  let minutesUntilClose: number | null = null;

  if (closeMinutes > openMinutes) {
    isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    if (isOpen) minutesUntilClose = closeMinutes - currentMinutes;
  } else {
    isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    if (isOpen) {
      minutesUntilClose =
        currentMinutes >= openMinutes
          ? 24 * 60 - currentMinutes + closeMinutes
          : closeMinutes - currentMinutes;
    }
  }

  const closingSoon =
    isOpen && minutesUntilClose != null && minutesUntilClose > 0 && minutesUntilClose <= 60;

  return {
    isOpen,
    closesAt: schedule.closeTime,
    closingSoon,
    minutesUntilClose,
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
