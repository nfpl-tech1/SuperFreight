import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
