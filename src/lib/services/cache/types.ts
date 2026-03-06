/**
 * Cache Service Types
 */

export interface CacheEntry<T> {
  data: T;
  expiresAt: string;
}

export interface CacheServiceConfig {
  defaultTTLMinutes: number;
}
