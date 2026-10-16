import { Prisma } from '@prisma/client';

/**
 * Public catalog filter: business HQ city OR any active branch in that city.
 * Enables multi-city brands without duplicating Business rows.
 */
export function businessWhereForCity(opts: {
  cityId?: string;
  citySlug?: string;
}): Prisma.BusinessWhereInput | undefined {
  const cityId = opts.cityId?.trim();
  const citySlug = opts.citySlug?.trim();
  if (!cityId && !citySlug) return undefined;

  const cityMatch: Prisma.CityWhereInput = cityId
    ? { id: cityId, isActive: true, deletedAt: null }
    : { slug: citySlug!, isActive: true, deletedAt: null };

  const branchCity: Prisma.BusinessBranchWhereInput = {
    deletedAt: null,
    isActive: true,
    city: cityMatch,
  };

  return {
    OR: [
      { city: cityMatch },
      { branches: { some: branchCity } },
    ],
  };
}

/** Prefer branch in the requested city, else primary, else first. */
export function pickBranchForCity<
  T extends { cityId?: string | null; isPrimary?: boolean },
>(branches: T[], cityId?: string | null): T | undefined {
  if (!branches.length) return undefined;
  if (cityId) {
    const inCity = branches.find((b) => b.cityId === cityId);
    if (inCity) return inCity;
  }
  return branches.find((b) => b.isPrimary) ?? branches[0];
}
