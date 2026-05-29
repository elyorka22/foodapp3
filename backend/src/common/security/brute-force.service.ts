import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class BruteForceService {
  constructor(private redis: RedisService) {}

  private key(scope: string, identifier: string) {
    return `bf:${scope}:${identifier}`;
  }

  async assertNotBlocked(scope: string, identifier: string) {
    const failures = await this.redis.get(this.key(scope, identifier));
    const max = parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS ?? '10', 10);
    if (failures && parseInt(failures, 10) >= max) {
      throw new HttpException(
        'Too many attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordFailure(scope: string, identifier: string) {
    const k = this.key(scope, identifier);
    const ttl = parseInt(process.env.BRUTE_FORCE_LOCK_TTL ?? '900', 10);
    const current = await this.redis.get(k);
    const next = current ? parseInt(current, 10) + 1 : 1;
    await this.redis.set(k, String(next), ttl);
    return next;
  }

  async clearFailures(scope: string, identifier: string) {
    await this.redis.del(this.key(scope, identifier));
  }
}
