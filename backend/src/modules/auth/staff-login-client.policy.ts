import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/** Explicit allowlist of staff-login client identifiers. */
export const STAFF_LOGIN_CLIENTS = ['control', 'business', 'web_admin'] as const;

export type StaffLoginClient = (typeof STAFF_LOGIN_CLIENTS)[number];

const CLIENT_ALLOWED_ROLES: Record<StaffLoginClient, readonly UserRole[]> = {
  control: [UserRole.SUPER_ADMIN],
  business: [UserRole.MANAGER, UserRole.BUSINESS],
  web_admin: [UserRole.MANAGER],
};

export function isStaffLoginClient(value: string): value is StaffLoginClient {
  return (STAFF_LOGIN_CLIENTS as readonly string[]).includes(value);
}

/**
 * Enforces role policy when a staff client identifier is present.
 *
 * Migration: missing / empty client → no extra restriction (legacy callers).
 * Unknown client values must never bypass restrictions.
 *
 * This is login-time policy only. The `client` value is self-asserted by the
 * caller and is not treated as proof of app identity on later API requests.
 */
export function assertStaffLoginClientAllowed(
  client: string | undefined | null,
  role: UserRole,
): void {
  if (client == null) return;

  const normalized = client.trim();
  if (!normalized) return;

  if (!isStaffLoginClient(normalized)) {
    throw new BadRequestException('Invalid login client');
  }

  const allowed = CLIENT_ALLOWED_ROLES[normalized];
  if (!allowed.includes(role)) {
    throw new ForbiddenException('This account cannot sign in via this client');
  }
}

export function rolesAllowedForStaffClient(
  client: StaffLoginClient,
): readonly UserRole[] {
  return CLIENT_ALLOWED_ROLES[client];
}
