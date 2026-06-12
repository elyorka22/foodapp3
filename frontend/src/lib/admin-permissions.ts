import type { StaffRole } from '@/hooks/use-admin-users';

/** Granular admin panel permissions */
export type AdminPermission =
  | 'dashboard'
  | 'orders'
  | 'restaurants'
  | 'restaurant.categories'
  | 'restaurant.menu'
  | 'restaurant.banners'
  | 'stores'
  | 'store.categories'
  | 'store.products'
  | 'store.types'
  | 'banners'
  | 'booking'
  | 'promotions'
  | 'notifications'
  | 'couriers'
  | 'customers'
  | 'staff'
  | 'reports'
  | 'settings'
  | 'system'
  | 'audit';

const MANAGER_PERMISSIONS: ReadonlySet<AdminPermission> = new Set([
  'dashboard',
  'orders',
  'restaurants',
  'restaurant.categories',
  'restaurant.menu',
  'restaurant.banners',
  'stores',
  'store.categories',
  'store.products',
  'banners',
  'booking',
  'promotions',
  'notifications',
  'couriers',
  'customers',
  'staff',
  'reports',
]);

export function hasAdminPermission(
  role: string | undefined | null,
  permission: AdminPermission,
): boolean {
  if (!role) return false;
  if (role === 'SUPER_ADMIN') return true;
  if (role === 'MANAGER') return MANAGER_PERMISSIONS.has(permission);
  return false;
}

export function isAdminPanelRole(role: string | undefined | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'MANAGER';
}
