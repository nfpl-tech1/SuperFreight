import { AppRole } from './app-role.entity';
export declare class RolePermission {
    id: number;
    roleId: string;
    moduleKey: string;
    canView: boolean;
    canEdit: boolean;
    role: AppRole;
}
