import { AppRoleDefinition, RolePermission, ScopeRule } from "@/lib/api";

export type EditableScopeRule = ScopeRule & { id?: number };

export type RoleModuleGroup = {
  key: string;
  label: string;
  modules: readonly string[];
};

export type RoleBuilderRole = AppRoleDefinition;
export type RoleBuilderPermission = RolePermission;
