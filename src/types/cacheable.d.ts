declare module 'cacheable' {
  interface CacheableMemoryOptions {
    ttl?: number | string;
    lruSize?: number;
  }

  export class CacheableMemory {
    constructor(options?: CacheableMemoryOptions);
  }

  interface CacheableOptions {
    primary?: any;
    secondary?: any;
    ttl?: number | string;
  }

  export class Cacheable {
    constructor(options?: CacheableOptions);
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number | string): Promise<void>;
    delete(key: string): Promise<void>;
  }
}
