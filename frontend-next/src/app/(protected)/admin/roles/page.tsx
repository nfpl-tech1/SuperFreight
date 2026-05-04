"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Plus, SquarePen, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  api,
  AppRoleDefinition,
  getErrorMessage,
  RolePermission,
} from "@/lib/api";
import { canEditModule } from "@/lib/module-access";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  buildExternalRoleId,
  createDefaultPermissions,
  createDefaultScopeRules,
  getFilteredModuleGroups,
  normalizePermissions,
  SCOPE_VALUE_OPTIONS,
  normalizeScopeRules,
} from "./role-builder.constants";
import { EditableScopeRule } from "./role-builder.types";
import { RoleDetailsCard } from "./components/role-details-card";
import { ModuleAccessSection } from "./components/module-access-section";
import { RoleListPanel } from "./components/role-list-panel";
import { WorkVisibilitySection } from "./components/work-visibility-section";

export default function AdminRolesPage() {
  const { user } = useAuth();
  const canEditRoles = canEditModule(user, "admin-roles");
  const [roles, setRoles] = useState<AppRoleDefinition[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<RolePermission[]>(createDefaultPermissions());
  const [scopeRules, setScopeRules] = useState<EditableScopeRule[]>(createDefaultScopeRules());
  const [moduleSearch, setModuleSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === editingRoleId) ?? null,
    [editingRoleId, roles]
  );

  const createMode = editingRoleId === null;
  const duplicateNameExists = createMode
    ? roles.some((role) => role.name.trim().toLowerCase() === name.trim().toLowerCase())
    : roles.some(
        (role) =>
          role.id !== editingRoleId &&
          role.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

  const selectedRoleIndex = selectedRole ? roles.findIndex((role) => role.id === selectedRole.id) : -1;
  const externalRoleId = buildExternalRoleId(selectedRole, selectedRoleIndex);
  const canDeleteSelectedRole = Boolean(selectedRole && !selectedRole.isSystem);
  const filteredModuleGroups = getFilteredModuleGroups(moduleSearch);

  const loadRoles = async () => {
    try {
      setRoles(await api.getRoles());
    } catch {
      toast.error("Failed to load roles");
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const startNewRole = (baseRole?: AppRoleDefinition | null) => {
    setEditingRoleId(null);
    setName(baseRole ? `${baseRole.name} Copy` : "");
    setDescription(baseRole?.description ?? "");
    setPermissions(baseRole ? normalizePermissions(baseRole.permissions) : createDefaultPermissions());
    setScopeRules(baseRole ? normalizeScopeRules(baseRole.scopeRules) : createDefaultScopeRules());
  };

  const loadIntoForm = (role: AppRoleDefinition) => {
    setEditingRoleId(role.id);
    setName(role.name);
    setDescription(role.description ?? "");
    setPermissions(normalizePermissions(role.permissions));
    setScopeRules(normalizeScopeRules(role.scopeRules));
  };

  const updatePermission = (moduleKey: string, field: "canView" | "canEdit", value: boolean) => {
    setPermissions((prev) =>
      prev.map((permission) =>
        permission.moduleKey === moduleKey
          ? {
              ...permission,
              canView:
                field === "canEdit" && value
                  ? true
                  : field === "canView"
                    ? value
                    : permission.canView,
              canEdit:
                field === "canView" && !value
                  ? false
                  : field === "canEdit"
                    ? value
                    : permission.canEdit,
            }
          : permission
      )
    );
  };

  const updateScopeType = (index: number, scopeType: string) => {
    const nextValue = SCOPE_VALUE_OPTIONS[scopeType]?.[0]?.value ?? "";
    setScopeRules((prev) =>
      prev.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, scopeType, scopeValue: nextValue } : rule
      )
    );
  };

  const updateScopeValue = (index: number, scopeValue: string) => {
    setScopeRules((prev) =>
      prev.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, scopeValue } : rule))
    );
  };

  const addScopeRule = () => {
    setScopeRules((prev) => [...prev, { scopeType: "trade_direction", scopeValue: "ALL" }]);
  };

  const removeScopeRule = (index: number) => {
    setScopeRules((prev) => prev.filter((_, ruleIndex) => ruleIndex !== index));
  };

  const setAllModuleViewAccess = (canView: boolean) => {
    setPermissions((prev) =>
      prev.map((permission) => ({
        ...permission,
        canView,
        canEdit: canView ? permission.canEdit : false,
      }))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (duplicateNameExists) {
      toast.error("A role with this name already exists");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: normalizePermissions(permissions).map((permission) => ({
          moduleKey: permission.moduleKey,
          canView: permission.canView,
          canEdit: permission.canView ? permission.canEdit : false,
        })),
        scopeRules: scopeRules
          .filter((rule) => rule.scopeType && rule.scopeValue)
          .map((rule) => ({
            scopeType: rule.scopeType,
            scopeValue: rule.scopeValue,
          })),
      };

      const savedRole = editingRoleId
        ? await api.updateRole(editingRoleId, body)
        : await api.createRole(body);

      await loadRoles();
      loadIntoForm(savedRole);
      toast.success(editingRoleId ? "Role updated" : "Role created");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save role"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole || !canDeleteSelectedRole) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the role "${selectedRole.name}"? Users assigned to this role must be unassigned first.`
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteRole(selectedRole.id);
      await loadRoles();
      startNewRole();
      toast.success("Role deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete role"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-[calc(100svh-3.5rem-4rem)] min-h-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <RoleListPanel roles={roles} editingRoleId={editingRoleId} onSelectRole={loadIntoForm} />

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 flex flex-wrap items-start justify-between gap-4 px-7 pb-5 pt-7">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">
              {createMode ? "Add New Role" : selectedRole?.name ?? "Edit Role"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure role details, module access, and work visibility rules.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => startNewRole(selectedRole)} disabled={!canEditRoles}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Current
            </Button>
            {!createMode && (
              <Button
                variant="outline"
                onClick={() => void handleDelete()}
                disabled={!canEditRoles || !canDeleteSelectedRole || deleting}
                className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:border-slate-200 disabled:text-slate-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete Role"}
              </Button>
            )}
            <Button onClick={() => startNewRole()} disabled={!canEditRoles}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Role
            </Button>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 border-t border-slate-200">
          <div className="space-y-8 px-7 py-6">
            <RoleDetailsCard
              name={name}
              description={description}
              externalRoleId={externalRoleId}
              duplicateNameExists={duplicateNameExists}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              disabled={!canEditRoles}
            />

            <ModuleAccessSection
              permissions={permissions}
              moduleGroups={filteredModuleGroups}
              moduleSearch={moduleSearch}
              onModuleSearchChange={setModuleSearch}
              onUpdatePermission={updatePermission}
              onSetAllModuleViewAccess={setAllModuleViewAccess}
              disabled={!canEditRoles}
            />

            <WorkVisibilitySection
              scopeRules={scopeRules}
              onAddRule={addScopeRule}
              onUpdateScopeType={updateScopeType}
              onUpdateScopeValue={updateScopeValue}
              onRemoveScopeRule={removeScopeRule}
              disabled={!canEditRoles}
            />
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t border-slate-200 bg-white px-7 py-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSave}
              disabled={!canEditRoles || !name.trim() || duplicateNameExists || saving}
            >
              <SquarePen className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : createMode ? "Create Role" : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => startNewRole()} disabled={!canEditRoles}>
              Start Blank
            </Button>
            {!createMode && !canDeleteSelectedRole && (
              <p className="self-center text-sm text-slate-500">System roles cannot be deleted.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
