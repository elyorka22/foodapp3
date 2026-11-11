/** Public customer route for a marketplace store. */
export function shopPublicPath(
  store: {
    id: string;
    slug?: string | null;
    businessType?: { slug?: string | null } | null;
  },
  opts?: { fromType?: string | null },
): string {
  const slug = store.slug?.trim();
  const path = slug
    ? `/shops/${encodeURIComponent(slug)}`
    : `/shops/${store.id}`;
  const from =
    opts?.fromType?.trim() ||
    store.businessType?.slug?.trim() ||
    '';
  if (!from) return path;
  return `${path}?from=${encodeURIComponent(from)}`;
}
