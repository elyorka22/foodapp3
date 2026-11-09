import { redirect } from 'next/navigation';
import { StoreTypeHub } from '@/components/stores/store-type-hub';

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

export default async function StoreTypePage({ params }: Props) {
  const raw = (await params).type;
  const segment = decodeURIComponent(raw ?? '').trim().toLowerCase();
  const type = TYPE_ALIASES[segment] ?? segment;

  if (!type) redirect('/stores');
  if (!HUB_TYPES.has(type)) redirect(`/stores?type=${encodeURIComponent(type)}`);

  return <StoreTypeHub type={type} />;
}
