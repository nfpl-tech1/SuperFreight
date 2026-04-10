import { Role } from '../entities/user.entity';
export declare class CreateUserDto {
    email: string;
    name?: string;
    role?: Role;
    isActive?: boolean;
    osUserId?: string;
}
