import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class VendorCcRecipientInputDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
