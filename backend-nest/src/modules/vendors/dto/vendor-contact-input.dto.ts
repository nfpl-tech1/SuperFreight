import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class VendorContactInputDto {
  @IsString()
  contactName: string;

  @IsOptional()
  @IsString()
  salutation?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsEmail()
  emailPrimary?: string;

  @IsOptional()
  @IsEmail()
  emailSecondary?: string;

  @IsOptional()
  @IsString()
  mobile1?: string;

  @IsOptional()
  @IsString()
  mobile2?: string;

  @IsOptional()
  @IsString()
  landline?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
