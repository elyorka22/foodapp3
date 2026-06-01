/** Dev-only logging to trace what triggers each API fetch. */
export function logApiFetch(method: string, path: string, trigger: string) {
  if (process.env.NODE_ENV === 'production') return;
  console.log(`[api-fetch] ${method} ${path} — trigger: ${trigger}`);
}
