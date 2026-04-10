import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { VendorCcRecipientInputDto } from './vendor-cc-recipient-input.dto';
import { VendorContactInputDto } from './vendor-contact-input.dto';

export class UpdateVendorOfficeDto {
  @IsOptional()
  @IsString()
  officeName?: string;

  @IsOptional()
  @IsString()
  cityName?: string;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsOptional()
  @IsString()
  countryName?: string;

  @IsOptional()
  @IsString()
  addressRaw?: string;

  @IsOptional()
  @IsString()
  externalCode?: string;

  @IsOptional()
  @IsString()
  specializationRaw?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isIataCertified?: boolean;

  @IsOptional()
  @IsBoolean()
  doesSeaFreight?: boolean;

  @IsOptional()
  @IsBoolean()
  doesProjectCargo?: boolean;

  @IsOptional()
  @IsBoolean()
  doesOwnConsolidation?: boolean;

  @IsOptional()
  @IsBoolean()
  doesOwnTransportation?: boolean;

  @IsOptional()
  @IsBoolean()
  doesOwnWarehousing?: boolean;

  @IsOptional()
  @IsBoolean()
  doesOwnCustomClearance?: boolean;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  typeIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  portIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorContactInputDto)
  contacts?: VendorContactInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorCcRecipientInputDto)
  ccRecipients?: VendorCcRecipientInputDto[];
}
