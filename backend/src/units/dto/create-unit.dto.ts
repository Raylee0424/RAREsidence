import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsIn,
  Max,
  Min,
} from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  // Whole cents only, so no floating-point rounding (250000 = $2,500.00).
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceCents!: number;

  @IsInt()
  bedrooms!: number;

  @IsInt()
  bathrooms!: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
  status?: string;

  @IsOptional()
  @IsString()
  amenities?: string;
}
