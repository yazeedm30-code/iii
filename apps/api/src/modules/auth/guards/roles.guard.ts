import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserKind } from '@prisma/client';
import { Request } from 'express';

import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedKinds = this.reflector.getAllAndOverride<UserKind[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowedKinds || allowedKinds.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    if (!request.user) return false;

    if (!allowedKinds.includes(request.user.kind as UserKind)) {
      throw new ForbiddenException({ code: 'FORBIDDEN_FOR_ROLE' });
    }
    return true;
  }
}
