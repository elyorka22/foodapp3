import { api } from '@/lib/api';
import { getCustomerToken } from '@/lib/customer';
import { getToken as getStaffToken } from '@/lib/auth';

const DEVICE_ID_KEY = 'foodapp_device_id';

export type DevicePlatform = 'android' | 'ios' | 'web';

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/** Customer — POST /notifications/devices */
export async function registerCustomerDevice(pushToken?: string) {
  const token = getCustomerToken();
  if (!token) return;
  await api('/notifications/devices', {
    method: 'POST',
    token,
    body: JSON.stringify({
      deviceId: getOrCreateDeviceId(),
      platform: 'web' satisfies DevicePlatform,
      ...(pushToken ? { pushToken } : {}),
    }),
  });
}

export async function unregisterCustomerDevice() {
  const token = getCustomerToken();
  if (!token) return;
  await api('/notifications/devices/unregister', {
    method: 'POST',
    token,
    body: JSON.stringify({
      deviceId: getOrCreateDeviceId(),
      platform: 'web',
    }),
  });
}

/** Staff (courier, manager, admin) — POST /notifications/staff/devices */
export async function registerStaffDevice(pushToken?: string) {
  const token = getStaffToken();
  if (!token) return;
  await api('/notifications/staff/devices', {
    method: 'POST',
    token,
    body: JSON.stringify({
      deviceId: getOrCreateDeviceId(),
      platform: 'web',
      ...(pushToken ? { pushToken } : {}),
    }),
  });
}

export async function unregisterStaffDevice() {
  const token = getStaffToken();
  if (!token) return;
  await api('/notifications/staff/devices/unregister', {
    method: 'POST',
    token,
    body: JSON.stringify({
      deviceId: getOrCreateDeviceId(),
      platform: 'web',
    }),
  });
}
