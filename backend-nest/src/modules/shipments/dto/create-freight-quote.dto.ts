import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateFreightQuoteDto {
  @IsString()
  inquiryId: string;

  @IsOptional()
  @IsString()
  rfqId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsString()
  vendorName: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  totalRate?: number;

  @IsOptional()
  @IsNumber()
  freightRate?: number;

  @IsOptional()
  @IsNumber()
  localCharges?: number;

  @IsOptional()
  @IsNumber()
  documentation?: number;

  @IsOptional()
  @IsNumber()
  transitDays?: number;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsObject()
  extractedFields?: Record<string, unknown>;
}
