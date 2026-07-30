import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateRoleStatusDto {
  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isActive!: boolean;
}