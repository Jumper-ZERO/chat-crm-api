import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';

import { createKeyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

export const cacheConfig: CacheModuleAsyncOptions = {
  useFactory: () => ({
    stores: [
      new Keyv({
        store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
      }),
      createKeyv(getRedisUrl()),
    ],
  }),
};

function getRedisUrl(): string {
  return process.env.REDIS_PASSWORD
    ? `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    : `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
}