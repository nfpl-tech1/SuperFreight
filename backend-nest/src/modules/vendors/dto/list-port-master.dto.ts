import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PortMode } from '../entities/port-master.entity';

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

export class ListPortMasterDto {
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
  @IsString()
  countryName?: string;

  @IsOptional()
  @IsEnum(PortMode)
  portMode?: PortMode;

  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
