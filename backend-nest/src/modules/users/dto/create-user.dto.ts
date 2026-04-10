import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  osUserId?: string;
}
