import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AppConfigService } from '../../config/app-config.service';
import { UploadsController } from './uploads.controller';
import { LocalStorageDriver } from './storage/local-storage.driver';
import { S3StorageDriver } from './storage/s3-storage.driver';
import { STORAGE_DRIVER } from './uploads.tokens';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => ({
        limits: { fileSize: cfg.uploadsMaxBytes },
      }),
    }),
  ],
  controllers: [UploadsController],
  providers: [
    LocalStorageDriver,
    S3StorageDriver,
    {
      provide: STORAGE_DRIVER,
      inject: [AppConfigService, LocalStorageDriver, S3StorageDriver],
      useFactory: (
        cfg: AppConfigService,
        local: LocalStorageDriver,
        s3: S3StorageDriver,
      ) => (cfg.storageDriver === 's3' ? s3 : local),
    },
  ],
  exports: [STORAGE_DRIVER],
})
export class UploadsModule {}
