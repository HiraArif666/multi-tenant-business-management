import { IsInt } from 'class-validator';

export class SelectBusinessUnitDto {
  @IsInt()
  businessUnitId: number | undefined;
}