import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertRateSheetDto {
  @IsString()
  shippingLine: string;

  @IsOptional()
  @IsString()
  tradeLane?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  effectiveMonth?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
