import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'john@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'pass123',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: 'John Doe',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'user',
    enum: ['superadmin', 'bu-admin', 'company-admin', 'user'],
  })
  @IsString()
  role!: string;

  @ApiProperty({
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  businessUnitId?: number;

  @ApiProperty({
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  companyId?: number;
}