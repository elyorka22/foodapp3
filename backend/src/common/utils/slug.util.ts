import { BadRequestException } from '@nestjs/common';

export const SLUG_TAKEN_MESSAGE =
  'This URL slug is already in use. Please choose a different one.';

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'x',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sh',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ў: 'o',
  қ: 'q',
  ғ: 'g',
  ҳ: 'h',
};

function transliterateToLatin(value: string): string {
  return Array.from(value)
    .map((char) => {
      const lower = char.toLowerCase();
      if (CYRILLIC_TO_LATIN[lower] !== undefined) {
        return CYRILLIC_TO_LATIN[lower];
      }
      return char;
    })
    .join('');
}

/** Convert a display name (or manual slug input) to a URL-safe slug. */
export function slugifyName(name: string): string {
  const base = transliterateToLatin(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'item';
}

/**
 * Pick the first available slug: base, base-2, base-3, …
 * `name` is slugified to form the base segment.
 */
export async function generateUniqueSlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugifyName(name);
  if (!(await isTaken(base))) {
    return base;
  }
  for (let n = 2; n < 10_000; n++) {
    const candidate = `${base}-${n}`;
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }
  throw new Error('Could not generate a unique slug');
}

/**
 * Resolve slug for create:
 * - No slug / slug matches auto slug from name → generate unique (pizza-house, pizza-house-2, …)
 * - Custom slug (differs from name-derived slug) → must be unique or 400
 */
export async function resolveSlugForCreate(options: {
  name: string;
  slug?: string | null;
  isTaken: (slug: string) => Promise<boolean>;
}): Promise<string> {
  const fromName = slugifyName(options.name);
  const manual = options.slug?.trim();

  if (manual) {
    const normalized = slugifyName(manual);
    if (normalized.length < 2) {
      throw new BadRequestException('Slug must be at least 2 characters');
    }
    if (normalized !== fromName) {
      if (await options.isTaken(normalized)) {
        throw new BadRequestException(SLUG_TAKEN_MESSAGE);
      }
      return normalized;
    }
  }

  return generateUniqueSlug(options.name, options.isTaken);
}

/** Validate manual slug on update; returns normalized slug. */
export async function resolveSlugForUpdate(options: {
  slug: string;
  isTaken: (slug: string) => Promise<boolean>;
}): Promise<string> {
  const normalized = slugifyName(options.slug);
  if (normalized.length < 2) {
    throw new BadRequestException('Slug must be at least 2 characters');
  }
  if (await options.isTaken(normalized)) {
    throw new BadRequestException(SLUG_TAKEN_MESSAGE);
  }
  return normalized;
}
