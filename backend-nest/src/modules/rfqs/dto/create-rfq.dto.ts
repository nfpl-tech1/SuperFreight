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

export class MscFieldsDto {
  @IsString()
  shipper: string;

  @IsString()
  forwarder: string;

  @IsString()
  por: string;

  @IsString()
  pol: string;

  @IsString()
  pod: string;

  @IsString()
  commodity: string;

  @IsString()
  cargoWeight: string;

  @IsString()
  volume: string;

  @IsString()
  requestedRates: string;

  @IsString()
  freeTimeIfAny: string;

  @IsString()
  validity: string;

  @IsString()
  termsOfShipment: string;

  @IsString()
  specificRemarks: string;
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
  @IsObject()
  @ValidateNested()
  @Type(() => MscFieldsDto)
  mscFields?: MscFieldsDto;

  @IsOptional()
  @IsString()
  customCcEmail?: string;

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
