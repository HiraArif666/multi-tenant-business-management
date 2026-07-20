import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateBusinessUnitAdminDto {
  @ApiProperty({
    example: 'financeadmin',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'finance@company.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'pass123',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: 'Finance Admin',
  })
  @IsString()
  name!: string;
}