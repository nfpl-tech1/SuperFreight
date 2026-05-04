import { Building2, ShieldCheck, UserCircle2 } from "lucide-react";
import { AppRoleDefinition, User } from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompactBadgeList } from "./compact-badge-list";
import { AssignmentPanel } from "./assignment-panel";

export function UserManagementTile({
  user,
  roles,
  departments,
  expandedUserId,
  onExpandedUserIdChange,
  onToggleDepartment,
  onToggleRole,
  canEdit,
}: {
  user: User;
  roles: AppRoleDefinition[];
  departments: readonly string[];
  expandedUserId: string | null;
  onExpandedUserIdChange: (value: string | null) => void;
  onToggleDepartment: (department: string) => void;
  onToggleRole: (roleId: string) => void;
  canEdit: boolean;
}) {
  const isExpanded = expandedUserId === user.id;

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200",
        isExpanded && "border-primary/20 ring-2 ring-primary/5"
      )}
    >
      <Accordion
        type="single"
        collapsible
        value={expandedUserId ?? ""}
        onValueChange={(value) => onExpandedUserIdChange(value || null)}
      >
        <AccordionItem value={user.id} className="border-b-0">
          <AccordionTrigger className="px-5 py-5 hover:no-underline">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                    isExpanded ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500"
                  )}
                >
                  <UserCircle2 className="h-5 w-5" />
                </div>

                <div className="min-w-0 text-left">
                  <div className="font-semibold text-slate-900">{user.name ?? "Unnamed User"}</div>
                  <div className="mt-1 text-sm text-slate-500">{user.email}</div>
                </div>
              </div>

              <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 xl:flex">
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="shrink-0">
                  {user.role}
                </Badge>
                <Badge variant={user.isActive ? "outline" : "destructive"} className="shrink-0">
                  {user.isActive ? "Active" : "Disabled"}
                </Badge>

                <div className="flex max-w-[220px] flex-nowrap items-center justify-end gap-2 overflow-hidden">
                  <CompactBadgeList items={user.departments} emptyLabel="No departments" />
                </div>

                <div className="flex max-w-[260px] flex-nowrap items-center justify-end gap-2 overflow-hidden">
                  <CompactBadgeList
                    items={user.customRoles.map((role) => role.name)}
                    emptyLabel="No roles assigned"
                  />
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-5 pb-5 pt-0">
            <div className="grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-2">
              <AssignmentPanel
                title="Departments"
                icon={<Building2 className="h-4 w-4" />}
                selectedLabels={user.departments}
                emptyLabel="No departments"
                options={departments.map((department) => ({
                  key: department,
                  label: department,
                  active: user.departments.includes(department),
                }))}
                onToggle={onToggleDepartment}
                disabled={!canEdit}
              />

              <AssignmentPanel
                title="Custom Roles"
                icon={<ShieldCheck className="h-4 w-4" />}
                selectedLabels={user.customRoles.map((role) => role.name)}
                emptyLabel="No roles assigned"
                options={roles.map((role) => ({
                  key: role.id,
                  label: role.name,
                  active: user.customRoles.some((item) => item.id === role.id),
                }))}
                onToggle={onToggleRole}
                disabled={!canEdit}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
