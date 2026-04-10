import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ResponseFieldDto {
  @IsString()
  fieldKey: string;

  @IsString()
  fieldLabel: string;

  @IsBoolean()
  isCustom: boolean;
}

class OfficeSelectionDto {
  @IsString()
  vendorId: string;

  @IsString()
  officeId: string;
}

export class CreateRfqDto {
  @IsString()
  inquiryId: string;

  @IsString()
  inquiryNumber: string;

  @IsString()
  departmentId: string;

  @IsObject()
  formValues: Record<string, unknown>;

  @IsArray()
  vendorIds: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfficeSelectionDto)
  officeSelections?: OfficeSelectionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseFieldDto)
  responseFields: ResponseFieldDto[];

  @IsOptional()
  @IsBoolean()
  sendNow?: boolean;

  @IsOptional()
  @IsString()
  mailSubject?: string;

  @IsOptional()
  @IsString()
  mailBodyHtml?: string;
}
