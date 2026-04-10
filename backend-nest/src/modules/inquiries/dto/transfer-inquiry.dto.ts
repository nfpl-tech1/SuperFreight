import { IsOptional, IsString } from 'class-validator';

export class TransferInquiryDto {
  @IsString()
  newOwnerUserId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
