import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountStatus, AuthProvider, UserKind } from '@prisma/client';

import { AdminService } from '../admin.service';
import { OnboardMerchantDto } from '../dto/onboarding.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PasswordService } from '../../auth/services/password.service';

@ApiBearerAuth()
@ApiTags('admin/onboarding')
@Roles(UserKind.ADMIN)
@Controller({ path: 'admin/onboarding', version: '1' })
export class OnboardingAdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly passwords: PasswordService,
  ) {}

  @Post('merchant')
  async onboardMerchant(@Body() dto: OnboardMerchantDto) {
    const email = dto.ownerEmail.toLowerCase().trim();

    const existingMerchant = await this.admin.prisma.merchant.findUnique({
      where: { slug: dto.slug },
    });
    if (existingMerchant) {
      throw new ConflictException({ code: 'MERCHANT_SLUG_TAKEN' });
    }

    const existingUser = await this.admin.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException({ code: 'EMAIL_TAKEN' });
    }

    const passwordHash = await this.passwords.hash(dto.ownerPassword);

    try {
      const merchant = await this.admin.prisma.merchant.create({
        data: {
          name: dto.name,
          nameAr: dto.nameAr,
          slug: dto.slug,
          logoUrl: dto.logoUrl,
          vatNumber: dto.vatNumber,
          crNumber: dto.crNumber,
          primaryColor: dto.primaryColor,
          profiles: {
            create: {
              position: dto.ownerPosition ?? 'Owner',
              user: {
                create: {
                  email,
                  emailVerifiedAt: new Date(),
                  kind: UserKind.MERCHANT,
                  status: AccountStatus.ACTIVE,
                  identities: {
                    create: {
                      provider: AuthProvider.EMAIL_PASSWORD,
                      providerUserId: email,
                      passwordHash,
                      metadata: { fullName: dto.ownerName },
                    },
                  },
                },
              },
            },
          },
        },
        include: { profiles: { include: { user: true } } },
      });

      return {
        merchantId: merchant.id,
        slug: merchant.slug,
        ownerUserId: merchant.profiles[0]?.user.id,
        ownerEmail: email,
      };
    } catch (err) {
      throw new BadRequestException({
        code: 'ONBOARDING_FAILED',
        message: (err as Error).message,
      });
    }
  }
}
