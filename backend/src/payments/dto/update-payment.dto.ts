import { IsString, IsIn, IsOptional, IsDateString } from 'class-validator';

// SUBMITTED is deliberately absent: only a tenant's report sets it.
export class UpdatePaymentDto {
  @IsString()
  @IsIn(['PENDING', 'PAID', 'OVERDUE'])
  status!: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
