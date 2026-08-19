import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import sharp from 'sharp';

import { DatabaseService } from './../database/database.service';
import { STORAGE_PROVIDER } from './storage/storage.provider';
import type { StorageProvider, UploadFolder } from './storage/storage.provider';

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
];

// Images get resized/recompressed down to this before saving
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 80;

@Injectable()
export class FilesService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,

    private readonly databaseService: DatabaseService,
  ) {}

  private isImage(mimeType: string) {
    return IMAGE_MIME_TYPES.includes(mimeType);
  }

  private isAllowed(mimeType: string) {
    return (
      IMAGE_MIME_TYPES.includes(mimeType) ||
      DOCUMENT_MIME_TYPES.includes(mimeType)
    );
  }

  async uploadFile(file: any, uploadedBy: number | null) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.isAllowed(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported file type. Allowed: images, PDF, Word, and Excel files.',
      );
    }

    const isImage = this.isImage(file.mimetype);
    const folder: UploadFolder = isImage ? 'images' : 'files';

    let buffer: Buffer = file.buffer;
    let mimeType: string = file.mimetype;
    let storageName = file.originalname;

    if (isImage) {
      // Recompress and cap dimensions, always normalized to webp —
      // this is what actually shrinks the file size, regardless of
      // whether the original was a huge PNG or JPG.
      buffer = await sharp(file.buffer)
        .resize({
          width: MAX_IMAGE_DIMENSION,
          height: MAX_IMAGE_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();

      mimeType = 'image/webp';

      const baseName = file.originalname.replace(
        /\.[^/.]+$/,
        '',
      );

      storageName = `${baseName}.webp`;
    }

    const stored = await this.storage.upload(
      {
        buffer,
        originalName: storageName,
        mimeType,
      },
      folder,
    );

    const record = await this.databaseService.File.create({
      originalName: file.originalname,
      fileName: stored.fileName,
      mimeType,
      size: stored.size,
      folder,
      url: stored.url,
      provider: stored.provider,
      uploadedBy,
    });

    return {
      success: true,
      data: record,
    };
  }

  async remove(id: number) {
    const file = await this.databaseService.File.findByPk(id);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.storage.delete(file.fileName, file.folder);
    await file.destroy();

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}