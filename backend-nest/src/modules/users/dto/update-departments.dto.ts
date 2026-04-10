import { IsArray, IsEnum } from 'class-validator';
import { Department } from '../entities/user-department.entity';

export class UpdateDepartmentsDto {
  @IsArray()
  @IsEnum(Department, { each: true })
  departments: Department[];
}
