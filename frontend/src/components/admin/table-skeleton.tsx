'use client';

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="animate-pulse space-y-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 border-t px-4 py-4 first:border-t-0 dark:border-white/10">
            {Array.from({ length: cols }).map((__, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-zinc-200 dark:bg-white/10" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
