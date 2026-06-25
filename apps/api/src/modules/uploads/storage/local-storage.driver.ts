import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { AppConfigService } from '../../../config/app-config.service';
import { StorageDriver, StoredObject } from './storage.interface';

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  private readonly logger = new Logger(LocalStorageDriver.name);
  private readonly rootDir: string;
  private readonly publicBaseUrl: string;

  constructor(config: AppConfigService) {
    this.rootDir = config.uploadsLocalDir;
    this.publicBaseUrl = `${config.appUrl}/static/uploads`;
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
    const absPath = path.join(this.rootDir, key);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, body);
    this.logger.debug(`stored ${key} (${body.length}b)`);
    return {
      key,
      url: `${this.publicBaseUrl}/${key}`,
      size: body.length,
      contentType,
    };
  }

  async delete(key: string): Promise<void> {
    const absPath = path.join(this.rootDir, key);
    try {
      await fs.unlink(absPath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw err;
    }
  }
}
