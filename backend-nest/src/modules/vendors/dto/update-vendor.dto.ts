import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID('4')
  primaryOfficeId?: string;
}
