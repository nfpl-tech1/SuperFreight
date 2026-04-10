import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppRole } from './entities/app-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleScopeRule } from './entities/role-scope-rule.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { CreateAppRoleDto } from './dto/create-app-role.dto';
export declare class RolesService implements OnModuleInit {
    private readonly roleRepo;
    private readonly permissionRepo;
    private readonly scopeRepo;
    private readonly assignmentRepo;
    constructor(roleRepo: Repository<AppRole>, permissionRepo: Repository<RolePermission>, scopeRepo: Repository<RoleScopeRule>, assignmentRepo: Repository<UserRoleAssignment>);
    onModuleInit(): Promise<void>;
    list(): Promise<AppRole[]>;
    create(dto: CreateAppRoleDto): Promise<AppRole>;
    update(id: string, dto: CreateAppRoleDto): Promise<AppRole>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    assignUserRoles(userId: string, roleIds: string[]): Promise<UserRoleAssignment[]>;
}
