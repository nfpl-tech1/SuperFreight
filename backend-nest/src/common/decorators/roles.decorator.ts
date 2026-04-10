import { SetMetadata } from '@nestjs/common';
import { Role } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to one or more roles.
 * @example @Roles(Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
