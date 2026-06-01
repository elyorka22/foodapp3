/** Backend list endpoints may return a raw array or { data: T[] }. */
export type ListPayload<T> = T[] | { data?: T[] | null; items?: T[] | null } | null | undefined;

export function unwrapList<T>(payload: ListPayload<T>): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}
