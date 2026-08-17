import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

import { CreateJobScheduleDto } from './create-job-schedule.dto';

export class UpdateJobScheduleDto extends PartialType(
  CreateJobScheduleDto,
) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}