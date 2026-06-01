import { Skeleton } from '@/components/ui/skeleton';

export function ShopsSkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
