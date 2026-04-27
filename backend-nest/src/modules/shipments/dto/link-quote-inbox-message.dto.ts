import { IsString } from 'class-validator';

export class LinkQuoteInboxMessageDto {
  @IsString()
  rfqId: string;

  @IsString()
  vendorId: string;
}
