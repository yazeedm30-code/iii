import { SetMetadata } from '@nestjs/common';
import { UserKind } from '@prisma/client';

export const ROLES_KEY = 'allowedUserKinds';
export const Roles = (...kinds: UserKind[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, kinds);
