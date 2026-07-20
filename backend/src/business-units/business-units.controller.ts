import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { BusinessUnitsService } from './business-units.service';

import { CreateBusinessUnitDto } from './dto/create-business-units.dto';

@ApiTags('Business Units')
@ApiBearerAuth()
@Controller('api/business-units')
export class BusinessUnitsController {
  constructor(
    private readonly businessUnitsService: BusinessUnitsService,
  ) {}

  @ApiOperation({
    summary:
      'Create Business Unit with BU Admin',
  })
  @Post()
  @UseGuards(JwtGuard)
  create(
    @Body() body: CreateBusinessUnitDto,
    @Req() req: any,
  ) {
    return this.businessUnitsService.create(
      body,
      req.user,
    );
  }
}