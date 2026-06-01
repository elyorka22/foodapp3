import type { JwtPayload } from '../../common/decorators/current-user.decorator';

/** Resolve businessId from API query (supports legacy restaurantId param). */
export function resolveBusinessId(params: {
  businessId?: string;
  restaurantId?: string;
}): string | undefined {
  const id = params.businessId?.trim() || params.restaurantId?.trim();
  return id || undefined;
}

/** Merchant scope for BUSINESS role JWT payloads. */
export function userBusinessId(user: JwtPayload): string | undefined {
  return user.businessId ?? user.restaurantId;
}
