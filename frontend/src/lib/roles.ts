export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  BUSINESS: 'BUSINESS',
  COURIER: 'COURIER',
} as const;

export function isBusinessRole(role: string): boolean {
  return role === ROLES.BUSINESS || role === 'RESTAURANT_OWNER' || role === 'RESTAURANT_STAFF';
}
