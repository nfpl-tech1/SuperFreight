"use client";

import { Search, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RolePermission } from "@/lib/api";
import { ROLE_BUILDER_MODULES } from "../role-builder.constants";
import { RoleModuleGroup } from "../role-builder.types";

type ModuleAccessSectionProps = {
  permissions: RolePermission[];
  moduleGroups: RoleModuleGroup[];
  moduleSearch: string;
  onModuleSearchChange: (value: string) => void;
  onUpdatePermission: (moduleKey: string, field: "canView" | "canEdit", value: boolean) => void;
  onSetAllModuleViewAccess: (canView: boolean) => void;
};

export function ModuleAccessSection({
  permissions,
  moduleGroups,
  moduleSearch,
  onModuleSearchChange,
  onUpdatePermission,
  onSetAllModuleViewAccess,
}: ModuleAccessSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-primary" />
          <div className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <ShieldCheck className="h-5 w-5" />
            Module Access
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={moduleSearch}
              onChange={(event) => onModuleSearchChange(event.target.value)}
              placeholder="Search modules..."
              className="h-10 pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => onSetAllModuleViewAccess(true)}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-primary"
          >
            Select All View
          </button>
          <button
            type="button"
            onClick={() => onSetAllModuleViewAccess(false)}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid gap-0 divide-y divide-slate-200">
          {moduleGroups.map((group) => (
            <div key={group.key}>
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {group.label}
              </div>
              <div className="grid gap-0 divide-y divide-slate-200">
                {group.modules.map((moduleKey) => {
                  const moduleDef = ROLE_BUILDER_MODULES.find((item) => item.key === moduleKey)!;
                  const permission = permissions.find((item) => item.moduleKey === moduleDef.key)!;

                  return (
                    <div
                      key={moduleDef.key}
                      className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_220px]"
                    >
                      <div>
                        <div className="font-medium text-slate-900">{moduleDef.label}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{moduleDef.description}</div>
                      </div>

                      <div className="flex items-center justify-start gap-6 lg:justify-end">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Checkbox
                            checked={permission.canView}
                            onCheckedChange={(value) => onUpdatePermission(moduleDef.key, "canView", !!value)}
                          />
                          Can view
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Checkbox
                            checked={permission.canEdit}
                            disabled={!permission.canView}
                            onCheckedChange={(value) => onUpdatePermission(moduleDef.key, "canEdit", !!value)}
                          />
                          Can edit
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {moduleGroups.length === 0 && (
            <div className="px-5 py-8 text-sm text-slate-500">No modules match your search.</div>
          )}
        </div>
      </div>
    </section>
  );
}
