import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PortMasterAliasInputDto {
  @IsString()
  alias: string;

  @IsOptional()
  @IsString()
  countryName?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  sourceWorkbook?: string;

  @IsOptional()
  @IsString()
  sourceSheet?: string;
}
