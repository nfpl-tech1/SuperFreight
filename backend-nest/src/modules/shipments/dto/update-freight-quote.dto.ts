import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateFreightQuoteDto {
  @IsOptional()
  @IsString()
  vendorName?: string;

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
  @IsString()
  reviewStatus?: string;

  @IsOptional()
  @IsObject()
  extractedFields?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  comparisonFields?: Record<string, unknown>;
}
