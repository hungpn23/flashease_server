import { JwtPayload, RefreshPayload } from '@/types/auth.type';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

export const Payload = createParamDecorator(
  (_data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<ExpressRequest>();
    return request['user'] as JwtPayload | RefreshPayload; // request['user'] is set in the AuthGuard
  },
);
