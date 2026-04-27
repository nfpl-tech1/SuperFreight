import { AppRoleDefinition, RolePermission, ScopeRule } from "@/lib/api";
import { MODULE_GROUPS, MODULES } from "@/lib/module-access";
import { EditableScopeRule, RoleModuleGroup } from "./role-builder.types";
export const ROLE_BUILDER_MODULES = MODULES;
export const ROLE_BUILDER_MODULE_GROUPS: RoleModuleGroup[] = [...MODULE_GROUPS];

export const SCOPE_TYPE_OPTIONS = [
  { value: "visibility", label: "Inquiry visibility" },
  { value: "trade_direction", label: "Trade lane" },
] as const;

export const SCOPE_VALUE_OPTIONS: Record<string, { value: string; label: string; help: string }[]> = {
  visibility: [
    { value: "OWNED_ONLY", label: "Own work only", help: "Only records owned by this user." },
    { value: "TEAM_ONLY", label: "Own team only", help: "Work handled by the user's team." },
    { value: "ALL", label: "All work", help: "Everything in SuperFreight." },
  ],
  trade_direction: [
    { value: "IMPORT", label: "Import only", help: "Only import business." },
    { value: "EXPORT", label: "Export only", help: "Only export business." },
    { value: "CROSS_TRADE", label: "Cross-trade only", help: "Only cross-trade shipments." },
    { value: "ALL", label: "All trade lanes", help: "No trade lane limit." },
  ],
};

export function createDefaultPermissions(): RolePermission[] {
  return ROLE_BUILDER_MODULES.map((module) => ({
    moduleKey: module.key,
    canView: true,
    canEdit: false,
  }));
}

export function createDefaultScopeRules(): EditableScopeRule[] {
  return [{ scopeType: "visibility", scopeValue: "OWNED_ONLY" }];
}

export function normalizePermissions(permissions: RolePermission[]): RolePermission[] {
  const permissionsByModule = new Map(
    permissions.map((permission) => [
      permission.moduleKey,
      {
        moduleKey: permission.moduleKey,
        canView: !!permission.canView,
        canEdit: !!permission.canEdit,
      },
    ])
  );

  return ROLE_BUILDER_MODULES.map((module) => {
    return (
      permissionsByModule.get(module.key) ?? {
        moduleKey: module.key,
        canView: false,
        canEdit: false,
      }
    );
  });
}

export function normalizeScopeRules(scopeRules: ScopeRule[]): EditableScopeRule[] {
  const supported = scopeRules
    .filter((rule) => SCOPE_VALUE_OPTIONS[rule.scopeType])
    .map((rule) => ({
      scopeType: rule.scopeType,
      scopeValue: rule.scopeValue,
    }));

  return supported.length ? supported : createDefaultScopeRules();
}

export function buildExternalRoleId(role: AppRoleDefinition | null, roleIndex: number) {
  if (role) {
    return `SF-RL-${String(roleIndex + 1).padStart(3, "0")}`;
  }

  return "SF-RL-NEW";
}

export function getFilteredModuleGroups(moduleSearch: string): RoleModuleGroup[] {
  const query = moduleSearch.trim().toLowerCase();

  return ROLE_BUILDER_MODULE_GROUPS.map((group) => ({
    ...group,
    modules: group.modules.filter((moduleKey) => {
      const moduleDef = ROLE_BUILDER_MODULES.find((item) => item.key === moduleKey);
      if (!moduleDef || !query) return true;

      return (
        moduleDef.label.toLowerCase().includes(query) ||
        moduleDef.description.toLowerCase().includes(query)
      );
    }),
  })).filter((group) => group.modules.length > 0);
}
