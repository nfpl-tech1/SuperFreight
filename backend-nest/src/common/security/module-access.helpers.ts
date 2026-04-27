import { Role, User } from '../../modules/users/entities/user.entity';

export function userHasModuleAccess(
  user: User | undefined | null,
  moduleKey: string,
  action: 'view' | 'edit',
) {
  if (!user) {
    return false;
  }

  if (user.role === Role.ADMIN || user.isAppAdmin) {
    return true;
  }

  return (user.roleAssignments ?? []).some((assignment) =>
    (assignment.role?.permissions ?? []).some((permission) => {
      if (permission.moduleKey !== moduleKey) {
        return false;
      }

      return action === 'edit' ? permission.canEdit : permission.canView;
    }),
  );
}
