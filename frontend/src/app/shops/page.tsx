import { Suspense } from 'react';
import ShopsClient from './shops-client';
import { ShopsSkeleton } from './shops-skeleton';

export default function ShopsPage() {
  return (
    <Suspense fallback={<ShopsSkeleton />}>
      <ShopsClient />
    </Suspense>
  );
}
