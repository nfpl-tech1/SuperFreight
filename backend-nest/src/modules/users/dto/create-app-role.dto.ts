import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PermissionDto {
  @IsString()
  moduleKey: string;

  @IsBoolean()
  canView: boolean;

  @IsBoolean()
  canEdit: boolean;
}

class ScopeRuleDto {
  @IsString()
  scopeType: string;

  @IsString()
  scopeValue: string;
}

export class CreateAppRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScopeRuleDto)
  scopeRules: ScopeRuleDto[];
}
