import { User } from './user.entity';
export declare enum Department {
    IMPORT = "IMPORT",
    EXPORT = "EXPORT",
    INTERNATIONAL = "INTERNATIONAL"
}
export declare class UserDepartment {
    id: number;
    userId: string;
    department: Department;
    user: User;
}
