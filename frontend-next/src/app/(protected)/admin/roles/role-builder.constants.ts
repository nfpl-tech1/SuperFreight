import { AppRoleDefinition, RolePermission, ScopeRule } from "@/lib/api";
import { EditableScopeRule, RoleModuleGroup } from "./role-builder.types";

export const MODULES = [
  { key: "dashboard", label: "Dashboard", description: "See summary metrics and daily work overview." },
  { key: "inquiries", label: "Inquiry Capture", description: "Create and manage freight inquiries." },
  { key: "rfq", label: "RFQ Drafting", description: "Prepare and send RFQs to vendors." },
  { key: "comparison", label: "Quote Comparison", description: "Compare vendor quotations inquiry-wise." },
  { key: "customer-quote", label: "Customer Quote", description: "Prepare customer-facing email drafts." },
  { key: "rate-sheets", label: "Rate Sheets", description: "View monthly rate references." },
  { key: "admin-users", label: "User Management", description: "Manage who can use SuperFreight." },
  { key: "admin-roles", label: "Role Builder", description: "Create and maintain role definitions." },
] as const;

export const MODULE_GROUPS: RoleModuleGroup[] = [
  {
    key: "operations",
    label: "Operations",
    modules: ["dashboard", "inquiries", "rfq", "comparison", "customer-quote"],
  },
  {
    key: "masters",
    label: "Masters & Admin",
    modules: ["rate-sheets", "admin-users", "admin-roles"],
  },
];

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
  return MODULES.map((module) => ({ moduleKey: module.key, canView: true, canEdit: false }));
}

export function createDefaultScopeRules(): EditableScopeRule[] {
  return [{ scopeType: "visibility", scopeValue: "OWNED_ONLY" }];
}

export function normalizeScopeRules(scopeRules: ScopeRule[]): EditableScopeRule[] {
  const supported = scopeRules.filter((rule) => SCOPE_VALUE_OPTIONS[rule.scopeType]);
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

  return MODULE_GROUPS.map((group) => ({
    ...group,
    modules: group.modules.filter((moduleKey) => {
      const module = MODULES.find((item) => item.key === moduleKey);
      if (!module || !query) return true;

      return (
        module.label.toLowerCase().includes(query) ||
        module.description.toLowerCase().includes(query)
      );
    }),
  })).filter((group) => group.modules.length > 0);
}
