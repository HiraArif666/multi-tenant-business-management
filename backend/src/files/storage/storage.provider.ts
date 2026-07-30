export type UploadFolder = 'images' | 'files';

export interface UploadableFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StoredFile {
  fileName: string;
  url: string;
  size: number;
}

// Anything that can save/delete files, keyed by fileName + folder,
// implements this. Swap the implementation (local disk, S3, GCS, ...)
// without touching FilesService or any controller that uses it.
export interface StorageProvider {
  upload(
    file: UploadableFile,
    folder: UploadFolder,
  ): Promise<StoredFile>;

  delete(
    fileName: string,
    folder: UploadFolder,
  ): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';