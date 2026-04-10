import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SsoLoginDto } from './dto/sso-login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        token_type: string;
        user: {
            id: string;
            osUserId: string | null;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").Role;
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
            departments: import("../users/entities/user-department.entity").Department[];
            customRoles: {
                id: string;
                name: string;
                permissions: import("../users/entities/role-permission.entity").RolePermission[];
                scopeRules: import("../users/entities/role-scope-rule.entity").RoleScopeRule[];
            }[];
        };
    }>;
    consumeSso(dto: SsoLoginDto): Promise<{
        access_token: string;
        token_type: string;
        user: {
            id: string;
            osUserId: string | null;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").Role;
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
            departments: import("../users/entities/user-department.entity").Department[];
            customRoles: {
                id: string;
                name: string;
                permissions: import("../users/entities/role-permission.entity").RolePermission[];
                scopeRules: import("../users/entities/role-scope-rule.entity").RoleScopeRule[];
            }[];
        };
    }>;
    logout(): {
        success: boolean;
    };
    getMe(user: User): {
        user: {
            id: string;
            osUserId: string | null;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").Role;
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
            departments: import("../users/entities/user-department.entity").Department[];
            customRoles: {
                id: string;
                name: string;
                permissions: import("../users/entities/role-permission.entity").RolePermission[];
                scopeRules: import("../users/entities/role-scope-rule.entity").RoleScopeRule[];
            }[];
        };
        onboarding_required: boolean;
    };
}
