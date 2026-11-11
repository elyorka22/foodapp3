import { redirect } from 'next/navigation';
import { StoreTypeDirectory } from '@/components/stores/store-type-directory';

/** URL segment → API business type slug. */
const TYPE_ALIASES: Record<string, string> = {
  cosmetics: 'perfume',
  kosmetika: 'perfume',
};

const HUB_TYPES = new Set([
  'grocery',
  'flowers',
  'perfume',
  'pharmacy',
  'gift',
  'electronics',
]);

type Props = {
  params: Promise<{ type: string }>;
};

/**
 * Type directory: vertical list of shops (e.g. /stores/flowers).
 * Individual shop menu (categories) stays at /shops/[slug].
 * Legacy category-grid hub kept in store-type-hub.tsx for reuse as shop interior.
 */
export default async function StoreTypePage({ params }: Props) {
  const raw = (await params).type;
  const segment = decodeURIComponent(raw ?? '').trim().toLowerCase();
  const type = TYPE_ALIASES[segment] ?? segment;

  if (!type) redirect('/stores');
  if (!HUB_TYPES.has(type)) redirect(`/stores?type=${encodeURIComponent(type)}`);

  return <StoreTypeDirectory type={type} />;
}
