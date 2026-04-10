import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  InquiryCustomerRole,
  InquiryType,
  ShipmentMode,
  TradeLane,
} from '../entities/inquiry.entity';

export class CreateInquiryDto {
  @IsString()
  customerName: string;

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

  @IsEnum(InquiryType)
  inquiryType: InquiryType;

  @IsOptional()
  @IsString()
  mailboxOwnerUserId?: string;

  @IsOptional()
  @IsString()
  ownerUserId?: string;
}
