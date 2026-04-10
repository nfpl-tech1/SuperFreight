import { Role, User } from './entities/user.entity';
import { OsUserPayload } from '../auth/os-auth.helpers';
import { ROLE_NAMES } from './role-presets';

export function getDefaultRoleName(isAppAdmin: boolean) {
  return isAppAdmin ? ROLE_NAMES.ADMIN : ROLE_NAMES.OPERATOR;
}

export function applyOsUserPayload(user: User, osUser: OsUserPayload) {
  user.osUserId = osUser.os_user_id;
  user.email = osUser.email ?? user.email;
  user.name = osUser.name ?? user.name;
  user.role = osUser.is_app_admin ? Role.ADMIN : Role.USER;
  user.isAppAdmin = !!osUser.is_app_admin;
  user.isTeamLead = !!osUser.is_team_lead;
  user.isActive = user.isActive ?? true;
  user.userType = osUser.user_type ?? user.userType;
  user.departmentSlug = osUser.department_slug ?? null;
  user.departmentName = osUser.department_name ?? null;
  user.orgId = osUser.org_id ?? null;
  user.orgName = osUser.org_name ?? null;
  user.lastLoginContext = osUser as Record<string, unknown>;
}
