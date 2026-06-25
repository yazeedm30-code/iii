import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return Number(this.config.get<string>('PORT', '3000'));
  }

  get apiPrefix(): string {
    return this.config.get<string>('API_PREFIX', 'api');
  }

  get appUrl(): string {
    return this.config.get<string>('APP_URL', 'http://localhost:3000');
  }

  get databaseUrl(): string {
    return this.required('DATABASE_URL');
  }

  get redisUrl(): string {
    return this.required('REDIS_URL');
  }

  get jwtAccessSecret(): string {
    return this.required('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.required('JWT_REFRESH_SECRET');
  }

  get jwtAccessTtl(): number {
    return Number(this.config.get<string>('JWT_ACCESS_TTL', '900'));
  }

  get jwtRefreshTtl(): number {
    return Number(this.config.get<string>('JWT_REFRESH_TTL', '2592000'));
  }

  get otpLength(): number {
    return Number(this.config.get<string>('OTP_LENGTH', '6'));
  }

  get otpTtlSeconds(): number {
    return Number(this.config.get<string>('OTP_TTL_SECONDS', '300'));
  }

  get otpMaxAttempts(): number {
    return Number(this.config.get<string>('OTP_MAX_ATTEMPTS', '5'));
  }

  get smsProvider(): string {
    return this.config.get<string>('SMS_PROVIDER', 'mock');
  }

  get logLevel(): string {
    return this.config.get<string>('LOG_LEVEL', 'info');
  }

  get throttleTtl(): number {
    return Number(this.config.get<string>('THROTTLE_TTL', '60'));
  }

  get throttleLimit(): number {
    return Number(this.config.get<string>('THROTTLE_LIMIT', '120'));
  }

  get corsOrigins(): string[] {
    const raw = this.config.get<string>('CORS_ORIGINS', '');
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  get stripeSecretKey(): string | undefined {
    return this.config.get<string>('STRIPE_SECRET_KEY');
  }

  get firebaseProjectId(): string | undefined {
    return this.config.get<string>('FIREBASE_PROJECT_ID');
  }

  get storageDriver(): 'local' | 's3' {
    const v = this.config.get<string>('STORAGE_DRIVER', 'local');
    return v === 's3' ? 's3' : 'local';
  }

  get uploadsLocalDir(): string {
    return this.config.get<string>('UPLOADS_LOCAL_DIR', '/var/lib/uploads');
  }

  get storageEndpoint(): string {
    return this.config.get<string>('STORAGE_ENDPOINT', '');
  }

  get storageRegion(): string {
    return this.config.get<string>('STORAGE_REGION', 'us-east-1');
  }

  get storageBucket(): string {
    return this.config.get<string>('STORAGE_BUCKET', 'drivethru-assets');
  }

  get storageAccessKey(): string {
    return this.config.get<string>('STORAGE_ACCESS_KEY', '');
  }

  get storageSecretKey(): string {
    return this.config.get<string>('STORAGE_SECRET_KEY', '');
  }

  get storagePublicUrl(): string {
    return this.config.get<string>('STORAGE_PUBLIC_URL', '');
  }

  get uploadsMaxBytes(): number {
    return Number(this.config.get<string>('UPLOADS_MAX_BYTES', String(5 * 1024 * 1024)));
  }

  private required(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}
