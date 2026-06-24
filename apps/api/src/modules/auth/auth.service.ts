import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserKind, AccountStatus, Locale } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { OtpService } from './services/otp.service';
import { TokenService, IssuedTokens } from './services/token.service';
import { SocialAuthService } from './services/social-auth.service';
import {
  CompleteRegistrationDto,
  RequestOtpDto,
  SocialAuthDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { generateReferralCode } from '../../common/utils/code-generator.util';

export interface AuthResult extends IssuedTokens {
  user: {
    id: string;
    kind: UserKind;
    status: AccountStatus;
    locale: Locale;
    profileComplete: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
    private readonly social: SocialAuthService,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<{ ttlSeconds: number }> {
    return this.otp.request(dto.phoneE164);
  }

  async verifyOtp(dto: VerifyOtpDto, meta: RequestMeta): Promise<AuthResult> {
    await this.otp.verify(dto.phoneE164, dto.code);

    let user = await this.prisma.user.findUnique({
      where: { phoneE164: dto.phoneE164 },
      include: { customer: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          kind: UserKind.CUSTOMER,
          phoneE164: dto.phoneE164,
          phoneVerifiedAt: new Date(),
          status: AccountStatus.PENDING_VERIFICATION,
          identities: {
            create: {
              provider: 'PHONE_OTP',
              providerUserId: dto.phoneE164,
            },
          },
        },
        include: { customer: true },
      });
    } else if (!user.phoneVerifiedAt) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerifiedAt: new Date() },
      });
    }

    return this.issueAuthResult(user, dto.deviceId, dto.deviceKind, meta);
  }

  async completeRegistration(userId: string, dto: CompleteRegistrationDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND' });

    if (user.customer) {
      throw new ConflictException({ code: 'PROFILE_ALREADY_EXISTS' });
    }

    const referredBy = dto.referralCode
      ? await this.prisma.customer.findUnique({ where: { referralCode: dto.referralCode } })
      : null;

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: AccountStatus.ACTIVE,
        preferredLocale: dto.preferredLocale ?? user.preferredLocale,
        customer: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            referralCode: await this.uniqueReferralCode(),
            referredById: referredBy?.id,
          },
        },
      },
      include: { customer: true },
    });

    return this.issueAuthResult(updated, undefined, undefined, {});
  }

  async socialSignIn(dto: SocialAuthDto, meta: RequestMeta): Promise<AuthResult> {
    const identity = await this.social.verify(
      dto.provider,
      dto.identityToken,
      dto.fullName,
    );

    let auth = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: identity.provider,
          providerUserId: identity.providerUserId,
        },
      },
      include: { user: { include: { customer: true } } },
    });

    if (!auth) {
      const user = await this.prisma.user.create({
        data: {
          kind: UserKind.CUSTOMER,
          email: identity.email,
          emailVerifiedAt: identity.email ? new Date() : null,
          status: AccountStatus.PENDING_VERIFICATION,
          identities: {
            create: {
              provider: identity.provider,
              providerUserId: identity.providerUserId,
            },
          },
        },
        include: { customer: true },
      });
      auth = await this.prisma.authIdentity.findUnique({
        where: {
          provider_providerUserId: {
            provider: identity.provider,
            providerUserId: identity.providerUserId,
          },
        },
        include: { user: { include: { customer: true } } },
      });
      if (!auth) throw new NotFoundException({ code: 'AUTH_IDENTITY_NOT_FOUND' });
      auth.user = user;
    }

    return this.issueAuthResult(auth.user, undefined, undefined, meta);
  }

  async refresh(refreshToken: string): Promise<IssuedTokens> {
    return this.tokens.rotate(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.revoke(refreshToken);
  }

  private async issueAuthResult(
    user: Prisma.UserGetPayload<{ include: { customer: true } }>,
    deviceId: string | undefined,
    deviceKind: 'IOS' | 'ANDROID' | 'WEB' | undefined,
    meta: RequestMeta,
  ): Promise<AuthResult> {
    const tokens = await this.tokens.issue({
      userId: user.id,
      kind: user.kind,
      scopes: [],
      deviceId,
      deviceKind,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        kind: user.kind,
        status: user.status,
        locale: user.preferredLocale,
        profileComplete: Boolean(user.customer),
      },
    };
  }

  private async uniqueReferralCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateReferralCode();
      const exists = await this.prisma.customer.findUnique({ where: { referralCode: code } });
      if (!exists) return code;
    }
    throw new ConflictException({ code: 'REFERRAL_CODE_GENERATION_FAILED' });
  }
}

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}
