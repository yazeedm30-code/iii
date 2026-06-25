import {
  BadRequestException,
  Controller,
  Inject,
  PayloadTooLargeException,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import * as mime from 'mime-types';

import { AppConfigService } from '../../config/app-config.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { STORAGE_DRIVER } from './uploads.tokens';
import { StorageDriver } from './storage/storage.interface';

interface UploadedExpressFile {
  buffer: Buffer;
  size: number;
  originalname: string;
  mimetype: string;
}

const ALLOWED_IMAGE_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

@ApiBearerAuth()
@ApiTags('uploads')
@Roles(UserKind.MERCHANT, UserKind.ADMIN)
@Controller({ path: 'uploads', version: '1' })
export class UploadsController {
  constructor(
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriver,
    private readonly config: AppConfigService,
  ) {}

  @Post('product-image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@UploadedFile() file: UploadedExpressFile) {
    return this.handleImageUpload(file, 'products');
  }

  @Post('category-image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCategoryImage(@UploadedFile() file: UploadedExpressFile) {
    return this.handleImageUpload(file, 'categories');
  }

  @Post('merchant-logo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMerchantLogo(@UploadedFile() file: UploadedExpressFile) {
    return this.handleImageUpload(file, 'logos');
  }

  private async handleImageUpload(file: UploadedExpressFile | undefined, folder: string) {
    if (!file) throw new BadRequestException({ code: 'FILE_REQUIRED' });

    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException({
        code: 'UNSUPPORTED_IMAGE_TYPE',
        message: 'Allowed: PNG, JPEG, WebP, GIF',
      });
    }
    if (file.size > this.config.uploadsMaxBytes) {
      throw new PayloadTooLargeException({
        code: 'IMAGE_TOO_LARGE',
        message: `Max size ${(this.config.uploadsMaxBytes / 1024 / 1024).toFixed(1)}MB`,
      });
    }

    const ext = (mime.extension(file.mimetype) || path.extname(file.originalname).slice(1) || 'bin')
      .toString()
      .toLowerCase();
    const key = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
    const stored = await this.storage.put({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return {
      url: stored.url,
      key: stored.key,
      contentType: stored.contentType,
      size: stored.size,
    };
  }
}
