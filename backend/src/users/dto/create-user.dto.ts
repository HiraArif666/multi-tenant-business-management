import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsInt,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Sara Khan',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'sara.staff',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'sara@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongPass123',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    example: '/uploads/avatars/sara.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({
    example: [1, 2],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];
}