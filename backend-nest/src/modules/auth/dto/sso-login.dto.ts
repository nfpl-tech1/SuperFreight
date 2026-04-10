import { IsString, MinLength } from 'class-validator';

export class SsoLoginDto {
  @IsString()
  @MinLength(20)
  token: string;
}
