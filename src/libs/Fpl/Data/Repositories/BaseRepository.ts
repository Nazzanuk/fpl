/**
 * Base repository with common functionality
 */

export interface CacheOptions {
  readonly ttl?: number;
  readonly force?: boolean;
}

export class BaseRepository {
  protected handleError(error: unknown, endpoint: string): Error {
    if (error instanceof Error) {
      return new Error(`FPL API error at ${endpoint}: ${error.message}`);
    }
    return new Error(`Unknown error at ${endpoint}`);
  }
}
