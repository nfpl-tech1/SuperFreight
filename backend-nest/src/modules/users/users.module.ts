import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AppRole } from './entities/app-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleScopeRule } from './entities/role-scope-rule.entity';
import { UserDepartment } from './entities/user-department.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { User } from './entities/user.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserDepartment,
      AppRole,
      RolePermission,
      RoleScopeRule,
      UserRoleAssignment,
    ]),
    AuditModule,
  ],
  controllers: [UsersController, RolesController],
  providers: [UsersService, RolesService],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
