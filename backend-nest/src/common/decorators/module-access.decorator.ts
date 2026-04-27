import { SetMetadata } from '@nestjs/common';

export type ModuleAccessAction = 'view' | 'edit';

export const MODULE_ACCESS_KEY = 'moduleAccess';

export type ModuleAccessRequirement = {
  moduleKey: string;
  action: ModuleAccessAction;
};

export const ModuleAccess = (
  moduleKey: string,
  action: ModuleAccessAction = 'view',
) => SetMetadata(MODULE_ACCESS_KEY, { moduleKey, action });
