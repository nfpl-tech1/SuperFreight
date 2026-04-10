import { User } from './entities/user.entity';
import { OsUserPayload } from '../auth/os-auth.helpers';
export declare function getDefaultRoleName(isAppAdmin: boolean): "Operations Admin" | "Freight Operator";
export declare function applyOsUserPayload(user: User, osUser: OsUserPayload): void;
