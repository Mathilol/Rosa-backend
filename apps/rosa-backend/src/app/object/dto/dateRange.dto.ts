import { IsDateString } from 'class-validator';

export class DateRangeDto {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;
}
