import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ConsumedSsoToken } from './entities/consumed-sso-token.entity';
import { User } from '../users/entities/user.entity';
type AuthSessionResult = {
    session: {
        access_token: string;
        token_type: 'bearer';
        user: ReturnType<UsersService['format']>;
    };
    refreshToken: string;
};
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    private readonly consumedRepo;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService, consumedRepo: Repository<ConsumedSsoToken>);
    loginWithOsCredentials(email: string, password: string): Promise<AuthSessionResult>;
    loginWithOsSso(token: string): Promise<AuthSessionResult>;
    refreshSession(refreshToken: string): Promise<AuthSessionResult>;
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
    getRefreshCookieName(): string;
    getRefreshCookieMaxAgeSeconds(): number;
    shouldUseSecureCookies(): boolean;
    private verifyOsSession;
    private consumeOsSsoToken;
    private verifyOsSsoToken;
    private verifyRefreshToken;
    private getOsPublicKey;
}
export {};
