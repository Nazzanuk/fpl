/**
 * Cache service interface and implementation for FPL data
 */

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache implementation
 * In production, this could be replaced with Redis or another cache store
 */
export class InMemoryCacheService implements CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtl = 300; // 5 minutes default

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.defaultTtl) * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Utility method to clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Start periodic cleanup
  startCleanup(intervalMs = 60000): void {
    setInterval(() => this.cleanup(), intervalMs);
  }
}

/**
 * Cache configuration for different data types
 */
export const CacheConfig = {
  // Static data that changes infrequently
  BOOTSTRAP_STATIC: 3600, // 1 hour
  TEAMS: 3600, // 1 hour
  
  // League data
  LEAGUE_STANDINGS: 300, // 5 minutes
  LEAGUE_STATS: 300, // 5 minutes
  LEAGUE_OWNERSHIP: 600, // 10 minutes
  
  // Manager data
  MANAGER_DETAIL: 180, // 3 minutes
  MANAGER_HISTORY: 1800, // 30 minutes
  MANAGER_TRANSFERS: 600, // 10 minutes
  
  // Player data
  PLAYER_DETAIL: 300, // 5 minutes
  PLAYER_FIXTURES: 1800, // 30 minutes
  PLAYER_HISTORY: 1800, // 30 minutes
  
  // Live data
  LIVE_STATS: 60, // 1 minute
  FIXTURES: 300, // 5 minutes
} as const;

// Global cache instance
export const cacheService = new InMemoryCacheService();

// Start cleanup on module load
cacheService.startCleanup();