import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
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
  @IsOptional()
  description?: string;

@ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  companyTypeId?: number;


  @ApiProperty({
    example: '+92 300 1234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'vendor@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    example: '123 Main St, Islamabad',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'https://vendor-website.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    example: '/uploads/images/xxx.webp',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    type: CreateCompanyAdminDto,
  })
  @ValidateNested()
  @Type(() => CreateCompanyAdminDto)
  admin!: CreateCompanyAdminDto;
}