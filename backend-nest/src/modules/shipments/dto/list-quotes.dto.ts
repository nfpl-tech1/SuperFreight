import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ListQuotesDto {
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @IsOptional()
  @IsString()
  rfqId?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeHistory?: boolean;
}
