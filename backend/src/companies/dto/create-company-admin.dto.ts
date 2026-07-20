import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateCompanyAdminDto {

  @ApiProperty({
    example: 'companyadmin',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'companyadmin@abc.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'pass123',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: 'Company Admin',
  })
  @IsString()
  name!: string;
}