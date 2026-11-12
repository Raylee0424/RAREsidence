import { IsString, IsIn } from 'class-validator';

export class UpdateBookingDto {
  @IsString()
  @IsIn(['PENDING', 'ACCEPTED', 'DECLINED'])
  status!: string;
}
