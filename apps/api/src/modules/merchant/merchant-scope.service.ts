import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MerchantScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async merchantIdForUser(userId: string): Promise<string> {
    const profile = await this.prisma.merchantProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new ForbiddenException({ code: 'NO_MERCHANT_PROFILE' });
    }
    return profile.merchantId;
  }
}
