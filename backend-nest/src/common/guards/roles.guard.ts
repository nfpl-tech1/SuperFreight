import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ANY_MODULE_ACCESS_KEY,
  MODULE_ACCESS_KEY,
  ModuleAccessRequirement,
} from '../decorators/module-access.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { userHasModuleAccess } from '../security/module-access.helpers';
import { Role } from '../../modules/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredModuleAccess =
      this.reflector.getAllAndOverride<ModuleAccessRequirement>(
        MODULE_ACCESS_KEY,
        [context.getHandler(), context.getClass()],
      );
    const anyRequiredModuleAccess =
      this.reflector.getAllAndOverride<ModuleAccessRequirement[]>(
        ANY_MODULE_ACCESS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredRoles?.length && !requiredModuleAccess && !anyRequiredModuleAccess?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRequiredRole = requiredRoles?.length
      ? requiredRoles.includes(user?.role)
      : true;
    const hasRequiredModuleAccess = requiredModuleAccess
      ? userHasModuleAccess(
          user,
          requiredModuleAccess.moduleKey,
          requiredModuleAccess.action,
        )
      : true;
    const hasAnyRequiredModuleAccess = anyRequiredModuleAccess?.length
      ? anyRequiredModuleAccess.some((requirement) =>
          userHasModuleAccess(user, requirement.moduleKey, requirement.action),
        )
      : true;

    return hasRequiredRole && hasRequiredModuleAccess && hasAnyRequiredModuleAccess;
  }
}
