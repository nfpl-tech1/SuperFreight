import { SetMetadata } from '@nestjs/common';

export type ModuleAccessAction = 'view' | 'edit';

export const MODULE_ACCESS_KEY = 'moduleAccess';
export const ANY_MODULE_ACCESS_KEY = 'anyModuleAccess';

export type ModuleAccessRequirement = {
  moduleKey: string;
  action: ModuleAccessAction;
};

export const ModuleAccess = (
  moduleKey: string,
  action: ModuleAccessAction = 'view',
) => SetMetadata(MODULE_ACCESS_KEY, { moduleKey, action });

export const AnyModuleAccess = (
  requirements: ModuleAccessRequirement[],
) => SetMetadata(ANY_MODULE_ACCESS_KEY, requirements);
