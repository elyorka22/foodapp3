/** Shared React Query defaults for admin list pages (avoid refetch storms). */
export const adminListQueryOptions = {
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;
