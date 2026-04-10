import { AppRole } from './app-role.entity';
export declare class RoleScopeRule {
    id: number;
    roleId: string;
    scopeType: string;
    scopeValue: string;
    role: AppRole;
}
