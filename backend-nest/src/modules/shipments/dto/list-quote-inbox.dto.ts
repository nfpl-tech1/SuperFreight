import { IsOptional, IsString } from 'class-validator';

export class ListQuoteInboxDto {
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @IsOptional()
  @IsString()
  rfqId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
