import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

import {
  StorageProvider,
  UploadableFile,
  UploadFolder,
  StoredFile,
} from './storage.provider';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  // uploads/ lives at the project root, next to src/ and dist/
  private readonly baseDir = join(process.cwd(), 'uploads');

  async upload(
    file: UploadableFile,
    folder: UploadFolder,
  ): Promise<StoredFile> {
    const dir = join(this.baseDir, folder);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const ext = extname(file.originalName);
    const fileName = `${randomUUID()}${ext}`;

    await writeFile(join(dir, fileName), file.buffer);

return {
  fileName,
  url: `/uploads/${folder}/${fileName}`,
  size: file.buffer.length,
  provider: 'local',
};
  }

  async delete(
    fileName: string,
    folder: UploadFolder,
  ): Promise<void> {
    const fullPath = join(this.baseDir, folder, fileName);

    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  }
}