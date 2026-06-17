const cache = new Map<string, { value: any; expiresAt: number }>();

export function setCache(key: string, value: any, ttlMs: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

/** Drop a cached entry so the next read recomputes (e.g. after a write). */
export function clearCache(key: string) {
  cache.delete(key);
}
