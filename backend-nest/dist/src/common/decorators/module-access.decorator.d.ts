export type ModuleAccessAction = 'view' | 'edit';
export declare const MODULE_ACCESS_KEY = "moduleAccess";
export type ModuleAccessRequirement = {
    moduleKey: string;
    action: ModuleAccessAction;
};
export declare const ModuleAccess: (moduleKey: string, action?: ModuleAccessAction) => import("@nestjs/common").CustomDecorator<string>;
