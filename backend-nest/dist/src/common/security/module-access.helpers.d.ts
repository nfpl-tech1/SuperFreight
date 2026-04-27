import { User } from '../../modules/users/entities/user.entity';
export declare function userHasModuleAccess(user: User | undefined | null, moduleKey: string, action: 'view' | 'edit'): boolean;
