import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'a1b2c3...',
    description: 'The raw token from the reset link',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'NewStrongPass123',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}