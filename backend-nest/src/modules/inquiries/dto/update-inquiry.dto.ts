import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  InquiryCustomerRole,
  InquiryType,
  ShipmentMode,
  TradeLane,
} from '../entities/inquiry.entity';

export class UpdateInquiryDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsEnum(InquiryCustomerRole)
  customerRole?: InquiryCustomerRole;

  @IsOptional()
  @IsEnum(TradeLane)
  tradeLane?: TradeLane;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsEnum(ShipmentMode)
  shipmentMode?: ShipmentMode;

  @IsOptional()
  @IsString()
  incoterm?: string;

  @IsOptional()
  @IsString()
  cargoSummary?: string;

  @IsOptional()
  @IsEnum(InquiryType)
  inquiryType?: InquiryType;
}
