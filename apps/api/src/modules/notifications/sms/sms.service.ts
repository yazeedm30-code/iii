import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: AppConfigService) {}

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    await this.dispatch(phoneE164, `Your verification code is ${code}`);
  }

  async sendOrderReady(phoneE164: string, orderNumber: string, pickupCode: string): Promise<void> {
    await this.dispatch(
      phoneE164,
      `Your order ${orderNumber} is ready. Pickup code: ${pickupCode}.`,
    );
  }

  private async dispatch(phoneE164: string, message: string): Promise<void> {
    if (this.config.smsProvider === 'mock') {
      this.logger.log(`SMS → ${phoneE164}: ${message}`);
      return;
    }
    // Integration seam: forward to the configured provider (Unifonic / Twilio / etc.)
    this.logger.warn(`SMS provider ${this.config.smsProvider} not yet wired`);
  }
}
