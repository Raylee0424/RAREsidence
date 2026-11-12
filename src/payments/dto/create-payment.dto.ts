import {
  IsNotEmpty,
  IsString,
  IsInt,
  Matches,
  IsIn,
  Max,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @IsNotEmpty()
  @IsString()
  unitId!: string;

  // Whole cents only, so totals add up exactly (150000 = $1,500.00).
  @IsInt()
  @Min(1)
  @Max(100_000_000)
  amountCents!: number;

  @IsString()
  @IsIn(['RENT', 'DEPOSIT', 'UTILITY'])
  type!: string;

  // A calendar date only (what <input type="date"> sends), stored as UTC midnight.
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dueDate must be a date in YYYY-MM-DD format',
  })
  dueDate!: string;
}
