import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  deepLink?: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly config: AppConfigService) {}

  async sendToDevice(token: string, payload: PushPayload): Promise<void> {
    if (!this.config.firebaseProjectId) {
      this.logger.debug(`PUSH (mock) → ${token}: ${payload.title}`);
      return;
    }
    // Production seam: forward to Firebase Admin Messaging.
    this.logger.log(`PUSH → ${token}: ${payload.title}`);
  }

  async sendToTokens(tokens: string[], payload: PushPayload): Promise<void> {
    await Promise.all(tokens.map((t) => this.sendToDevice(t, payload)));
  }
}
