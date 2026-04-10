import { UserDepartment } from './user-department.entity';
import { UserRoleAssignment } from './user-role-assignment.entity';
export declare enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}
export declare class User {
    id: string;
    osUserId: string | null;
    email: string;
    name: string;
    role: Role;
    isAppAdmin: boolean;
    isTeamLead: boolean;
    isActive: boolean;
    userType: string | null;
    departmentSlug: string | null;
    departmentName: string | null;
    orgId: string | null;
    orgName: string | null;
    outlookConnectedAt: Date | null;
    emailSignature: string | null;
    lastLoginContext: Record<string, unknown> | null;
    departments: UserDepartment[];
    roleAssignments: UserRoleAssignment[];
    createdAt: Date;
    updatedAt: Date;
}
