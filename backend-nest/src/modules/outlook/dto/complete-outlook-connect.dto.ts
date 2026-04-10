import { IsString } from 'class-validator';

export class CompleteOutlookConnectDto {
  @IsString()
  code: string;
}
