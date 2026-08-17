import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import express from 'express';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { ImportService } from './import.service';

@ApiTags('Import')
@ApiBearerAuth()
@Controller('api/import')
@UseGuards(JwtGuard, PermissionGuard)
export class ImportController {
  constructor(
    private readonly importService: ImportService,
  ) {}

  @Get('modules')
  @HasPermission(['import.view', 'expense.view'])
  @ApiOperation({ summary: 'Get available import modules' })
  getModules() {
    return {
      success: true,
      data: this.importService.getAvailableModules(),
    };
  }

  @Get('template')
  @HasPermission(['import.view', 'expense.view'])
  @ApiOperation({ summary: 'Download Excel template for import module' })
  async downloadTemplate(
    @Query('module') module: string,
    @Res() res: express.Response,
  ) {
    if (!module) {
      throw new BadRequestException('Module is required');
    }

    const buffer = await this.importService.buildTemplate(
      module,
    );

    res
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          `attachment; filename="${module}-template.xlsx"`,
      })
      .status(200)
      .send(buffer);
  }

  @Post('preview')
  @HasPermission(['import.execute', 'expense.add'])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiOperation({ summary: 'Preview imported Excel rows before saving' })
  preview(
    @UploadedFile() file: any,
    @Body('module') module: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!module) {
      throw new BadRequestException('Module is required');
    }

    return this.importService.previewImport(module, file);
  }

  @Post('confirm')
  @HasPermission(['import.execute', 'expense.add'])
  @ApiOperation({ summary: 'Confirm and save imported Excel rows' })
  confirm(
    @Body() body: {
      module: string;
      rows: any[];
    },
    @Req() req: any,
  ) {
    if (!body.module) {
      throw new BadRequestException('Module is required');
    }

    if (!Array.isArray(body.rows)) {
      throw new BadRequestException('Rows are required');
    }

    return this.importService.confirmImport(
      body.module,
      body.rows,
      req.user,
    );
  }
}
