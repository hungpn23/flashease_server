import { IS_PUBLIC, IS_REFRESH_TOKEN } from '@/constants/index';
import { AuthService } from '@/modules/auth/auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequest>();

    const hasPublicDecorator = this.hasDecorator(IS_PUBLIC, context);
    if (hasPublicDecorator) return true;

    const hasRefreshTokenDecorator = this.hasDecorator(
      IS_REFRESH_TOKEN,
      context,
    );
    if (hasRefreshTokenDecorator) {
      const refreshToken = this.extractTokenFromHeader(request);
      request['user'] = this.authService.verifyRefreshToken(refreshToken);

      return true;
    }

    const accessToken = this.extractTokenFromHeader(request);
    request['user'] = await this.authService.verifyAccessToken(accessToken);

    return true;
  }

  private hasDecorator(key: string, context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(key, [
      context.getClass(),
      context.getHandler(),
    ]);
  }

  private extractTokenFromHeader(request: ExpressRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }
}
