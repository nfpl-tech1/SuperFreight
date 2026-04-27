import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SsoLoginDto } from './dto/sso-login.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, response: Response): Promise<{
        access_token: string;
        token_type: "bearer";
        user: ReturnType<import("../users/users.service").UsersService["format"]>;
    }>;
    consumeSso(dto: SsoLoginDto, response: Response): Promise<{
        access_token: string;
        token_type: "bearer";
        user: ReturnType<import("../users/users.service").UsersService["format"]>;
    }>;
    refresh(request: Request, response: Response): Promise<{
        access_token: string;
        token_type: "bearer";
        user: ReturnType<import("../users/users.service").UsersService["format"]>;
    }>;
    logout(response: Response): {
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
                description: string | null;
                isSystem: boolean;
                permissions: import("../users/entities/role-permission.entity").RolePermission[];
                scopeRules: import("../users/entities/role-scope-rule.entity").RoleScopeRule[];
            }[];
        };
        onboarding_required: boolean;
    };
    private setRefreshTokenCookie;
    private clearRefreshTokenCookie;
}
