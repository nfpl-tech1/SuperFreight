import { User } from './entities/user.entity';

function formatAssignedRole(user: User) {
  return (
    user.roleAssignments?.map((assignment) => ({
      id: assignment.role.id,
      name: assignment.role.name,
      description: assignment.role.description ?? null,
      isSystem: assignment.role.isSystem,
      permissions: assignment.role.permissions ?? [],
      scopeRules: assignment.role.scopeRules ?? [],
    })) ?? []
  );
}

export function formatUserResponse(user: User) {
  return {
    id: user.id,
    osUserId: user.osUserId ?? null,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    isAppAdmin: user.isAppAdmin,
    isTeamLead: user.isTeamLead,
    userType: user.userType,
    departmentSlug: user.departmentSlug,
    departmentName: user.departmentName,
    orgId: user.orgId,
    orgName: user.orgName,
    outlookConnected: !!user.outlookConnectedAt,
    outlookConnectedAt: user.outlookConnectedAt,
    emailSignature: user.emailSignature ?? null,
    departments:
      user.departments?.map((department) => department.department) ?? [],
    customRoles: formatAssignedRole(user),
  };
}
