import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AppConfigService } from '../../../config/app-config.service';
import { generateNumericCode } from '../../../common/utils/code-generator.util';
import { SmsService } from '../../notifications/sms/sms.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly sms: SmsService,
  ) {}

  async request(phoneE164: string): Promise<{ ttlSeconds: number }> {
    const code = generateNumericCode(this.config.otpLength);
    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + this.config.otpTtlSeconds * 1000);

    await this.prisma.otpChallenge.create({
      data: {
        destination: phoneE164,
        channel: 'SMS',
        codeHash,
        expiresAt,
      },
    });

    await this.sms.sendOtp(phoneE164, code);

    if (this.config.isDevelopment) {
      this.logger.debug(`OTP for ${phoneE164}: ${code}`);
    }

    return { ttlSeconds: this.config.otpTtlSeconds };
  }

  async verify(phoneE164: string, code: string): Promise<void> {
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        destination: phoneE164,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new BadRequestException({
        code: 'OTP_NOT_FOUND',
        message: 'No active OTP for this phone number',
      });
    }

    if (challenge.attempts >= this.config.otpMaxAttempts) {
      throw new BadRequestException({
        code: 'OTP_TOO_MANY_ATTEMPTS',
        message: 'Too many verification attempts',
      });
    }

    const matches = await argon2.verify(challenge.codeHash, code);

    if (!matches) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException({
        code: 'OTP_INVALID',
        message: 'Invalid verification code',
      });
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
  }
}
