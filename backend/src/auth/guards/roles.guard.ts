import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ALLOWED_ROLES_KEY } from '../decorators/allowed-roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles =
      this.reflector.get<string[]>(
        ALLOWED_ROLES_KEY,
        context.getHandler(),
      ) ??
      this.reflector.get<string[]>(
        ALLOWED_ROLES_KEY,
        context.getClass(),
      );

    // No @AllowedRoles declared on this route — nothing to restrict.
    if (!allowedRoles || !allowedRoles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Your role does not have access to this resource',
      );
    }

    return true;
  }
}