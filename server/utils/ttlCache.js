/**
 * Small in-memory cache with a time-to-live and a size cap (oldest entry evicted first).
 */
export const createTtlCache = ({ ttlMs, max = 10000 }) => {
  const entries = new Map();

  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= Date.now()) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value) {
      if (ttlMs <= 0) return;
      if (entries.size >= max && !entries.has(key)) entries.delete(entries.keys().next().value);
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    delete(key) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
  };
};
