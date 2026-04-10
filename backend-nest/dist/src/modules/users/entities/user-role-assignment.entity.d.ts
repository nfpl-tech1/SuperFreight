import { AppRole } from './app-role.entity';
import { User } from './user.entity';
export declare class UserRoleAssignment {
    id: number;
    userId: string;
    roleId: string;
    user: User;
    role: AppRole;
}
