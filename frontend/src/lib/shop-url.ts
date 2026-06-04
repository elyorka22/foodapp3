/** Public customer route for a marketplace store. */
export function shopPublicPath(store: { id: string; slug?: string | null }): string {
  const slug = store.slug?.trim();
  if (slug) return `/shops/${encodeURIComponent(slug)}`;
  return `/shops/${store.id}`;
}
