import { RolePermission } from './role-permission.entity';
import { RoleScopeRule } from './role-scope-rule.entity';
import { UserRoleAssignment } from './user-role-assignment.entity';
export declare class AppRole {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    permissions: RolePermission[];
    scopeRules: RoleScopeRule[];
    userAssignments: UserRoleAssignment[];
    createdAt: Date;
    updatedAt: Date;
}
