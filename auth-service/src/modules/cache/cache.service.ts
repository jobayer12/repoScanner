import { CACHE_MANAGER, Cache, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CacheService implements CacheStore {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    return this.cacheManager.set(key, value, ttl);
  }

  async get<T = any>(key: string): Promise<T> {
    try {
      return this.cacheManager.get(key);
    } catch (e) {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    return this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    return this.cacheManager.reset();
  }
}
