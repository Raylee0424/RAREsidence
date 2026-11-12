import { IsOptional, IsString } from 'class-validator';

export class AssignUnitDto {
  @IsOptional()
  @IsString()
  unitId?: string | null;
}
