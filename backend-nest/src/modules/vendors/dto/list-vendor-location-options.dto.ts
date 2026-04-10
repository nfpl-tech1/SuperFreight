import { Transform, Type } from 'class-transformer';
import {
  IsArray,
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
  VendorQuoteTypeContext,
} from '../domain/vendor-selection-context';
import { PortMode } from '../entities/port-master.entity';
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

export class ListVendorLocationOptionsDto {
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
  pageSize?: number = 20;

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
  @IsEnum(VendorLocationRole)
  locationRole?: VendorLocationRole;

  @IsOptional()
  @IsEnum(PortMode)
  portMode?: PortMode;

  @IsOptional()
  @IsString()
  countryName?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsArray()
  @IsEnum(VendorTypeCode, { each: true })
  typeCodes?: VendorTypeCode[];
}
