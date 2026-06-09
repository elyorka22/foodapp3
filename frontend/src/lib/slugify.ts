/** URL-safe slug from a display name (Latin letters and digits). */
export function slugify(value: string): string {
  const base = value
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
