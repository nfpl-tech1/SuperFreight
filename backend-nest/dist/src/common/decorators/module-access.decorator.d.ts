export type ModuleAccessAction = 'view' | 'edit';
export declare const MODULE_ACCESS_KEY = "moduleAccess";
export declare const ANY_MODULE_ACCESS_KEY = "anyModuleAccess";
export type ModuleAccessRequirement = {
    moduleKey: string;
    action: ModuleAccessAction;
};
export declare const ModuleAccess: (moduleKey: string, action?: ModuleAccessAction) => import("@nestjs/common").CustomDecorator<string>;
export declare const AnyModuleAccess: (requirements: ModuleAccessRequirement[]) => import("@nestjs/common").CustomDecorator<string>;
