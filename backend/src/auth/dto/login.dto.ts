import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'superadmin',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'admin123',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean = false;
}