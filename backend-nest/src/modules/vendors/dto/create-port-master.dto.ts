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

export class CreatePortMasterDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  cityName?: string;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsString()
  countryName: string;

  @IsEnum(PortMode)
  portMode: PortMode;

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
