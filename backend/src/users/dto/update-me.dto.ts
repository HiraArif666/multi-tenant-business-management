import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({
    example: 'Sara Khan',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'sara@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '/uploads/images/xxx.webp',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({
    example: 'NewStrongPass123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}