export type WorkingHourRow = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export function isRestaurantOpenNow(
  workingHours: WorkingHourRow[],
  holidays: { date: Date }[],
  now = new Date(),
): boolean {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const isHoliday = holidays.some((h) => {
    const d = new Date(h.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  if (isHoliday) return false;

  if (!workingHours.length) return true;

  const day = now.getDay();
  const schedule = workingHours.find((w) => w.dayOfWeek === day);
  if (!schedule || schedule.isClosed) return false;

  const [openH, openM] = schedule.openTime.split(':').map(Number);
  const [closeH, closeM] = schedule.closeTime.split(':').map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + (openM || 0);
  const closeMinutes = closeH * 60 + (closeM || 0);

  if (closeMinutes > openMinutes) {
    return minutes >= openMinutes && minutes < closeMinutes;
  }
  return minutes >= openMinutes || minutes < closeMinutes;
}
