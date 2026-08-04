import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class UpsertApprovalSettingDto {
  @ApiProperty({
    example: [3, 7],
    description: 'User IDs allowed to approve this module',
  })
  @IsArray()
  @IsInt({ each: true })
  approverIds!: number[];
}
