import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  VendorLocationKind,
  VendorLocationRole,
  VendorLocationScope,
  VendorQuoteTypeContext,
} from '../domain/vendor-selection-context';
import { VendorTypeCode } from '../entities/vendor-type-master.entity';

function parseCsv(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) =>
        typeof entry === 'string' ? entry.split(',') : String(entry).split(','),
      )
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return value;
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean' || value === undefined || value === null) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no'].includes(normalized)) {
      return false;
    }
  }

  return value;
}

export class ListVendorsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  countryName?: string;

  @IsOptional()
  @IsString()
  cityName?: string;

  @IsOptional()
  @IsEnum(VendorQuoteTypeContext)
  quoteTypeContext?: VendorQuoteTypeContext;

  @IsOptional()
  @IsString()
  shipmentMode?: string;

  @IsOptional()
  @IsEnum(VendorLocationKind)
  locationKind?: VendorLocationKind;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  locationCountryName?: string;

  @IsOptional()
  @IsEnum(VendorLocationRole)
  locationRole?: VendorLocationRole;

  @IsOptional()
  @IsEnum(VendorLocationScope)
  locationScope?: VendorLocationScope;

  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsArray()
  @IsEnum(VendorTypeCode, { each: true })
  typeCodes?: VendorTypeCode[];

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  isIataCertified?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  doesSeaFreight?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  doesProjectCargo?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  doesOwnConsolidation?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  doesOwnTransportation?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  doesOwnWarehousing?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  doesOwnCustomClearance?: boolean;
}
