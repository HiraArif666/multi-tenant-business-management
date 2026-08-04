import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Office Supplies',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    example: 'Bought printer paper and pens',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 2500,
  })
  @IsNumber()
  @Min(0)
  amount!: number;
}
