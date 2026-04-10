import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ConsumedSsoToken } from './entities/consumed-sso-token.entity';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    private readonly consumedRepo;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService, consumedRepo: Repository<ConsumedSsoToken>);
    loginWithOsCredentials(email: string, password: string): Promise<{
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
    loginWithOsSso(token: string): Promise<{
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
    buildSessionPayload(user: User): {
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
    private issueSession;
    private verifyOsSession;
    private consumeOsSsoToken;
    private verifyOsSsoToken;
    private getOsPublicKey;
}
