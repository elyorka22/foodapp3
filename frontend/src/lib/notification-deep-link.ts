/**
 * Navigate from FCM/web push `data.route` (set by backend push-payload.util).
 */
export function navigateFromNotificationRoute(route: string | undefined) {
  if (typeof window === 'undefined') return;
  if (!route) {
    window.location.href = '/notifications';
    return;
  }
  if (route.startsWith('/track/') || route === '/promotions' || route === '/notifications') {
    window.location.href = route;
    return;
  }
  window.location.href = '/notifications';
}
