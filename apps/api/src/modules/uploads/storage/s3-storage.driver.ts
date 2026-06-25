import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import { AppConfigService } from '../../../config/app-config.service';
import { StorageDriver, StoredObject } from './storage.interface';

@Injectable()
export class S3StorageDriver implements StorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: AppConfigService) {
    this.client = new S3Client({
      region: config.storageRegion,
      endpoint: config.storageEndpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.storageAccessKey,
        secretAccessKey: config.storageSecretKey,
      },
    });
    this.bucket = config.storageBucket;
    this.publicBaseUrl =
      config.storagePublicUrl || `${config.storageEndpoint}/${config.storageBucket}`;
  }

  async put({
    key,
    body,
    contentType,
  }: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: 'public-read',
      }),
    );
    return {
      key,
      url: `${this.publicBaseUrl}/${key}`,
      size: body.length,
      contentType,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
