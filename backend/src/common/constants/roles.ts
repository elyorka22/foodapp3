import { UserRole } from '@prisma/client';

/** Staff roles that manage a single business (restaurant, shop, etc.) */
export const BUSINESS_STAFF_ROLES: UserRole[] = [UserRole.BUSINESS];

export function isBusinessStaffRole(role: string): boolean {
  return (
    role === UserRole.BUSINESS ||
    role === 'RESTAURANT_OWNER' ||
    role === 'RESTAURANT_STAFF'
  );
}

export const ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.MANAGER];
