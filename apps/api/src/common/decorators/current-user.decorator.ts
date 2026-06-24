import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  kind: 'CUSTOMER' | 'EMPLOYEE' | 'MERCHANT' | 'ADMIN';
  sessionId: string;
  scopes: string[];
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    if (!request.user) {
      throw new Error('CurrentUser decorator used without authentication guard');
    }
    return request.user;
  },
);
