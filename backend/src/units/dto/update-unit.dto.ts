import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsIn,
  Max,
  Min,
} from 'class-validator';

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // Whole cents only (250000 = $2,500.00).
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceCents?: number;

  @IsOptional()
  @IsInt()
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  bathrooms?: number;

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
