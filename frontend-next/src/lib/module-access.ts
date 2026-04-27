import type { RolePermission, User } from "@/lib/api";

export type AppModuleDefinition = {
  key: string;
  label: string;
  description: string;
  path: string;
  groupKey: "operations" | "masters" | "personal" | "admin";
  requiresBaseAdmin?: boolean;
};

export const MODULES: readonly AppModuleDefinition[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "See summary metrics and daily work overview.",
    path: "/dashboard",
    groupKey: "operations",
  },
  {
    key: "inquiries",
    label: "Inquiry Capture",
    description: "Create and manage freight inquiries.",
    path: "/inquiries",
    groupKey: "operations",
  },
  {
    key: "rfq",
    label: "RFQ Drafting",
    description: "Prepare and send RFQs to vendors.",
    path: "/rfq",
    groupKey: "operations",
  },
  {
    key: "comparison",
    label: "Quote Comparison",
    description: "Compare vendor quotations inquiry-wise.",
    path: "/comparison",
    groupKey: "operations",
  },
  {
    key: "customer-quote",
    label: "Customer Quote",
    description: "Prepare customer-facing email drafts.",
    path: "/customer-quote",
    groupKey: "operations",
  },
  {
    key: "vendors",
    label: "Vendor Master",
    description: "Browse and maintain the vendor master catalog.",
    path: "/vendors",
    groupKey: "masters",
  },
  {
    key: "rate-sheets",
    label: "Rate Sheets",
    description: "View monthly rate references.",
    path: "/rate-sheets",
    groupKey: "masters",
  },
  {
    key: "profile",
    label: "Profile",
    description: "Manage personal account and Outlook settings.",
    path: "/profile",
    groupKey: "personal",
  },
  {
    key: "admin-users",
    label: "User Management",
    description: "Manage who can use SuperFreight.",
    path: "/admin/users",
    groupKey: "admin",
    requiresBaseAdmin: true,
  },
  {
    key: "admin-roles",
    label: "Role Builder",
    description: "Create and maintain role definitions.",
    path: "/admin/roles",
    groupKey: "admin",
    requiresBaseAdmin: true,
  },
  {
    key: "admin-ports",
    label: "Port Master",
    description: "Maintain the shared airport and seaport master data.",
    path: "/admin/ports",
    groupKey: "admin",
  },
] as const;

export const MODULE_GROUPS = [
  {
    key: "operations",
    label: "Operations",
    modules: ["dashboard", "inquiries", "rfq", "comparison", "customer-quote"],
  },
  {
    key: "masters",
    label: "Masters",
    modules: ["vendors", "rate-sheets"],
  },
  {
    key: "personal",
    label: "Personal",
    modules: ["profile"],
  },
  {
    key: "admin",
    label: "Admin",
    modules: ["admin-users", "admin-roles", "admin-ports"],
  },
] as const;

type ModuleKey = (typeof MODULES)[number]["key"];

const MODULES_BY_KEY = new Map(MODULES.map((moduleDef) => [moduleDef.key, moduleDef]));
const ORDERED_MODULE_PATHS = [...MODULES].sort(
  (left, right) => right.path.length - left.path.length,
);

function isBaseAdmin(user: User | null) {
  return user?.role === "ADMIN" || user?.isAppAdmin === true;
}

function matchesPath(pathname: string, routePath: string) {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

export function getModuleByKey(moduleKey: string) {
  return MODULES_BY_KEY.get(moduleKey);
}

export function getModuleForPathname(pathname: string): AppModuleDefinition | null {
  return ORDERED_MODULE_PATHS.find((moduleDef) => matchesPath(pathname, moduleDef.path)) ?? null;
}

export function getMergedModulePermissions(user: User | null) {
  const permissions = new Map<ModuleKey, RolePermission>();

  for (const moduleDef of MODULES) {
    permissions.set(moduleDef.key, {
      moduleKey: moduleDef.key,
      canView: false,
      canEdit: false,
    });
  }

  if (!user) {
    return permissions;
  }

  for (const role of user.customRoles) {
    for (const permission of role.permissions ?? []) {
      const moduleDef = MODULES_BY_KEY.get(permission.moduleKey);
      if (!moduleDef) {
        continue;
      }

      if (moduleDef.requiresBaseAdmin && !isBaseAdmin(user)) {
        continue;
      }

      const current = permissions.get(moduleDef.key);
      permissions.set(moduleDef.key, {
        moduleKey: moduleDef.key,
        canView: Boolean(current?.canView || permission.canView),
        canEdit: Boolean(current?.canEdit || permission.canEdit),
      });
    }
  }

  return permissions;
}

export function canViewModule(user: User | null, moduleKey: string) {
  return Boolean(getMergedModulePermissions(user).get(moduleKey as ModuleKey)?.canView);
}

export function canEditModule(user: User | null, moduleKey: string) {
  return Boolean(getMergedModulePermissions(user).get(moduleKey as ModuleKey)?.canEdit);
}

export function canViewPathname(user: User | null, pathname: string) {
  const moduleDef = getModuleForPathname(pathname);
  if (!moduleDef) {
    return true;
  }

  return canViewModule(user, moduleDef.key);
}

export function getFirstAccessiblePath(user: User | null) {
  const permissions = getMergedModulePermissions(user);
  const visibleModule = MODULES.find(
    (moduleDef) => permissions.get(moduleDef.key as ModuleKey)?.canView,
  );
  return visibleModule?.path ?? null;
}
