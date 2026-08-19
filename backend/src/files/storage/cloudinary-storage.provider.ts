import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import {
  StorageProvider,
  UploadableFile,
  UploadFolder,
  StoredFile,
} from './storage.provider';

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(
    file: UploadableFile,
    folder: UploadFolder,
  ): Promise<StoredFile> {
    const extension = extname(file.originalName);

    const fileName = `${randomUUID()}${extension}`;

    const resourceType =
      folder === 'images' ? 'image' : 'raw';

    const publicId =
      folder === 'images'
        ? `${folder}/${fileName.replace(extension, '')}`
        : `${folder}/${fileName}`;

    const result = await new Promise<any>(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              resource_type: resourceType,
              overwrite: false,
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              resolve(result);
            },
          );

        uploadStream.end(file.buffer);
      },
    );

    return {
      fileName,
      url: result.secure_url,
      size: file.buffer.length,
      provider: 'cloudinary',
    };
  }

  async delete(
    fileName: string,
    folder: UploadFolder,
  ): Promise<void> {
    const extension = extname(fileName);

    const publicId =
      folder === 'images'
        ? `${folder}/${fileName.replace(extension, '')}`
        : `${folder}/${fileName}`;

    const resourceType =
      folder === 'images' ? 'image' : 'raw';

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
        invalidate: true,
      },
    );
  }
}