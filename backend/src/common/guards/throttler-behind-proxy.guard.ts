import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ') && auth.length > 20) {
      return true;
    }
    const url = request.originalUrl ?? request.url ?? '';
    if (url.includes('/telegram-bot/webhook/')) {
      return true;
    }
    return super.shouldSkip(context);
  }

  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const ips = req.ips as string[] | undefined;
    const ip = ips?.length ? ips[0] : (req.ip as string | undefined);
    const base = ip ?? 'unknown';

    const url = (req.originalUrl as string | undefined) ?? (req.url as string | undefined) ?? '';
    if (url.includes('/auth/login')) {
      const body = req.body as { email?: string; phone?: string } | undefined;
      const loginId = body?.email?.trim().toLowerCase() ?? body?.phone?.trim() ?? '';
      if (loginId) {
        return Promise.resolve(`${base}:staff:${loginId}`);
      }
    }

    return Promise.resolve(base);
  }
}
