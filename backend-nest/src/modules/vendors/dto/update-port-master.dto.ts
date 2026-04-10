import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PortMode } from '../entities/port-master.entity';
import { PortMasterAliasInputDto } from './port-master-alias-input.dto';

export class UpdatePortMasterDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

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
  @IsEnum(PortMode)
  portMode?: PortMode;

  @IsOptional()
  @IsString()
  unlocode?: string;

  @IsOptional()
  @IsString()
  sourceConfidence?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortMasterAliasInputDto)
  aliases?: PortMasterAliasInputDto[];
}
