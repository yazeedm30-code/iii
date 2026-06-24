import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { DeviceKind, UserKind } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AppConfigService } from '../../../config/app-config.service';

export interface AccessTokenPayload {
  sub: string;
  kind: UserKind;
  sid: string;
  scopes: string[];
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface IssueOptions {
  userId: string;
  kind: UserKind;
  scopes: string[];
  deviceId?: string;
  deviceKind?: DeviceKind;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async issue(options: IssueOptions): Promise<IssuedTokens> {
    const refreshTokenRaw = randomBytes(48).toString('base64url');
    const refreshTokenHash = await argon2.hash(refreshTokenRaw);
    const expiresAt = new Date(Date.now() + this.config.jwtRefreshTtl * 1000);

    const session = await this.prisma.session.create({
      data: {
        userId: options.userId,
        refreshTokenHash,
        deviceId: options.deviceId,
        deviceKind: options.deviceKind,
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
        expiresAt,
      },
    });

    const payload: AccessTokenPayload = {
      sub: options.userId,
      kind: options.kind,
      sid: session.id,
      scopes: options.scopes,
    };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      refreshToken: `${session.id}.${refreshTokenRaw}`,
      expiresIn: this.config.jwtAccessTtl,
    };
  }

  async rotate(refreshToken: string): Promise<IssuedTokens> {
    const [sessionId, raw] = refreshToken.split('.');
    if (!sessionId || !raw) {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN' });
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: 'SESSION_EXPIRED' });
    }

    const matches = await argon2.verify(session.refreshTokenHash, raw);
    if (!matches) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException({ code: 'REFRESH_TOKEN_REUSED' });
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issue({
      userId: session.user.id,
      kind: session.user.kind,
      scopes: [],
      deviceId: session.deviceId ?? undefined,
      deviceKind: session.deviceKind ?? undefined,
    });
  }

  async revoke(refreshToken: string): Promise<void> {
    const [sessionId] = refreshToken.split('.');
    if (!sessionId) return;
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
