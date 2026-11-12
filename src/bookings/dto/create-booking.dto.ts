import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

// This endpoint is public, so trim input and cap every field's length.
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  unitId!: string;

  @Transform(trim)
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  guestName!: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  guestEmail!: string;

  @Transform(trim)
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  guestPhone!: string;

  // A calendar date only (what <input type="date"> sends), no time or zone.
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'preferredDate must be a date in YYYY-MM-DD format',
  })
  preferredDate!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
