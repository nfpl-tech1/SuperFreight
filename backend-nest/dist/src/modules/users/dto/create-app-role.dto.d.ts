declare class PermissionDto {
    moduleKey: string;
    canView: boolean;
    canEdit: boolean;
}
declare class ScopeRuleDto {
    scopeType: string;
    scopeValue: string;
}
export declare class CreateAppRoleDto {
    name: string;
    description?: string;
    permissions: PermissionDto[];
    scopeRules: ScopeRuleDto[];
}
export {};
