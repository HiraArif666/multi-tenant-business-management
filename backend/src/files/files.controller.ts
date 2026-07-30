import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { JwtGuard } from './../auth/guards/jwt.guard';
import { FilesService } from './files.service';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('api/files')
@UseGuards(JwtGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) {}

  // ==========================
  // Upload a file
  // ==========================

  @Post('upload')
  @ApiOperation({
    summary:
      'Upload a file (image, PDF, Word, or Excel). Images are auto-compressed.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      // Keep the file in memory instead of writing to disk immediately —
      // FilesService needs the raw buffer to compress images before
      // handing it to the storage provider.
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB, pre-compression
      },
    }),
  )
  upload(
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.filesService.uploadFile(
      file,
      req.user.id,
    );
  }

  // ==========================
  // Delete a file
  // ==========================

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an uploaded file',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.filesService.remove(id);
  }
}