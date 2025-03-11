import { NO_CACHE } from '@/constants';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ExtraCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const noCache = this.reflector.get<boolean>(NO_CACHE, context.getHandler());
    if (noCache) return undefined;

    return super.trackBy(context);
  }
}
