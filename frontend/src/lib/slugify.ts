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
    .map((char) => CYRILLIC_TO_LATIN[char.toLowerCase()] ?? char)
    .join('');
}

/** URL-safe slug from a display name (Latin letters and digits). */
export function slugify(value: string): string {
  const base = transliterateToLatin(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'item';
}

/** Slug for new records; keeps existing slug when editing. */
export function resolveFormSlug(name: string, existingSlug?: string | null): string {
  const kept = existingSlug?.trim();
  if (kept) return kept;
  return slugify(name);
}
