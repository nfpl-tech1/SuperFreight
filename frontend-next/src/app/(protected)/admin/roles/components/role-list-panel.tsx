"use client";

import { AppRoleDefinition } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type RoleListPanelProps = {
  roles: AppRoleDefinition[];
  editingRoleId: string | null;
  onSelectRole: (role: AppRoleDefinition) => void;
};

export function RoleListPanel({ roles, editingRoleId, onSelectRole }: RoleListPanelProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/70">
      <div className="shrink-0 border-b border-slate-200 px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Existing Roles
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-4">
          {roles.map((role) => {
            const isSelected = role.id === editingRoleId;
            const fullAccess = role.scopeRules.some(
              (rule) => rule.scopeType === "visibility" && rule.scopeValue === "ALL"
            );

            return (
              <button
                key={role.id}
                className={`w-full rounded-2xl border bg-white p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary/30 shadow-[inset_3px_0_0_0_theme(colors.primary.DEFAULT)]"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => onSelectRole(role)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{role.name}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {role.description ?? "No description added yet."}
                    </div>
                  </div>
                  <Badge
                    variant={fullAccess ? "default" : "outline"}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
                  >
                    {fullAccess ? "Active" : "Custom"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
