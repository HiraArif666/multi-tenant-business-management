import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsArray,
  IsIn,
  IsString,
  IsOptional,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateJobScheduleDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  reportId!: number;

  @ApiProperty({ example: [3, 7, 12] })
  @IsArray()
  @IsInt({ each: true })
  recipientUserIds!: number[];

  @ApiProperty({
    example: 'weekly',
    enum: ['daily', 'weekly', 'monthly'],
  })
  @IsIn(['daily', 'weekly', 'monthly'])
  frequency!: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({
    example: '09:00',
    description: '24-hour HH:mm, server local time',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm 24-hour format',
  })
  time!: string;

  @ApiPropertyOptional({
    example: 1,
    description: '0 (Sun) - 6 (Sat), required when frequency is weekly',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiPropertyOptional({
    example: 1,
    description: '1-31, required when frequency is monthly',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;
}