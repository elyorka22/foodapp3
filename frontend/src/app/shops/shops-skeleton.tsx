import { Skeleton } from '@/components/ui/skeleton';

export function ShopsSkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
