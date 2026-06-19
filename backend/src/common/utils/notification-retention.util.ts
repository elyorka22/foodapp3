/** In-app push history is kept for 24 hours, then removed from lists and DB. */
export const NOTIFICATION_RETENTION_HOURS = 24;

export function notificationRetentionCutoff(): Date {
  return new Date(Date.now() - NOTIFICATION_RETENTION_HOURS * 60 * 60 * 1000);
}
