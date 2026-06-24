import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '../../../config/app-config.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AccessTokenPayload } from '../services/token.service';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtAccessSecret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
    });
    if (!session || session.revokedAt) {
      throw new UnauthorizedException({ code: 'SESSION_REVOKED' });
    }
    return {
      userId: payload.sub,
      kind: payload.kind,
      sessionId: payload.sid,
      scopes: payload.scopes ?? [],
    };
  }
}
