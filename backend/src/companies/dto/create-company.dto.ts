import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCompanyAdminDto } from './create-company-admin.dto';

export class CreateCompanyDto {

  @ApiProperty({
    example: 'ABC Technologies',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Software Company',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  companyTypeId!: number;

  @ApiProperty({
    type: CreateCompanyAdminDto,
  })
  @ValidateNested()
  @Type(() => CreateCompanyAdminDto)
  admin!: CreateCompanyAdminDto;
}