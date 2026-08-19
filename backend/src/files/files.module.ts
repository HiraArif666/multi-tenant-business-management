import { Module } from '@nestjs/common';

import { DatabaseModule } from './../database/database.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

import { STORAGE_PROVIDER } from './storage/storage.provider';
import { CloudinaryStorageProvider } from './storage/cloudinary-storage.provider';
@Module({
  imports: [DatabaseModule],
  controllers: [FilesController],
  providers: [
    FilesService,

    // Everything in this module depends on the StorageProvider
    // *interface*, not on LocalStorageProvider directly. To move to S3
    // later: write an S3StorageProvider implementing StorageProvider,
    // then change only the line below to `useClass: S3StorageProvider`.
    // No other file in the app needs to change.
  {
  provide: STORAGE_PROVIDER,
  useClass: CloudinaryStorageProvider,
},
  ],
  exports: [FilesService],
})
export class FilesModule {}