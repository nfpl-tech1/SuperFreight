import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GenerateCustomerDraftDto {
  @IsString()
  inquiryId: string;

  @IsString()
  quoteId: string;

  @IsOptional()
  @IsNumber()
  marginPercent?: number;
}
