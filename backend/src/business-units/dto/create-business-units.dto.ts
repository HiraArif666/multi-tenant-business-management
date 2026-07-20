import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateBusinessUnitAdminDto } from './create-business-unit-admin.dto';

export class CreateBusinessUnitDto {
  @ApiProperty({
    example: 'Finance',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Finance Department',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: CreateBusinessUnitAdminDto,
  })
  @ValidateNested()
  @Type(() => CreateBusinessUnitAdminDto)
  admin!: CreateBusinessUnitAdminDto;
}