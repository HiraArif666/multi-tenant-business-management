import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCompanyTypeDto {

  @ApiProperty({
    example: 'Software House',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Software Companies',
    required: false,
  })
  @IsString()
  description?: string;
}