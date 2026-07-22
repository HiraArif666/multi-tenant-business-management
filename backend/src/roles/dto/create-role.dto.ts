import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'HR Manager',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Human Resource Manager',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsInt()
  businessUnitId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: [1, 2, 3, 4],
  })
  @IsArray()
  permissionIds!: number[];
}