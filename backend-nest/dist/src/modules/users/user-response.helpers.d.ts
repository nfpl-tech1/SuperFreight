import { User } from './entities/user.entity';
export declare function formatUserResponse(user: User): {
    id: string;
    osUserId: string | null;
    email: string;
    name: string;
    role: import("./entities/user.entity").Role;
    isActive: boolean;
    isAppAdmin: boolean;
    isTeamLead: boolean;
    userType: string | null;
    departmentSlug: string | null;
    departmentName: string | null;
    orgId: string | null;
    orgName: string | null;
    outlookConnected: boolean;
    outlookConnectedAt: Date | null;
    emailSignature: string | null;
    departments: import("./entities/user-department.entity").Department[];
    customRoles: {
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        permissions: import("./entities/role-permission.entity").RolePermission[];
        scopeRules: import("./entities/role-scope-rule.entity").RoleScopeRule[];
    }[];
};
