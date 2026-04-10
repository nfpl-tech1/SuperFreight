import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Role } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
