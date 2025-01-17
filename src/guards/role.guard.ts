import { Role, ROLE_KEY } from '@/constants/index';
import { IRequestUser } from '@/interfaces/request-user.interface';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) return true;

    const request = context.switchToHttp().getRequest<IRequestUser>();
    if (!request['user']) throw new ForbiddenException();

    return requiredRole === request['user'].role;
  }
}
