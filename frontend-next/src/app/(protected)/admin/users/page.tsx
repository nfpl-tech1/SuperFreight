"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, AppRoleDefinition, User } from "@/lib/api";
import { toast } from "sonner";
import { DEPARTMENTS } from "./user-management.constants";
import { UserManagementTile } from "./components/user-management-tile";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<AppRoleDefinition[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [userData, roleData] = await Promise.all([api.getUsers(), api.getRoles()]);
      setUsers(userData);
      setRoles(roleData);
    } catch {
      toast.error("Failed to load admin data");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const applyUpdatedUser = (updatedUser: User, successMessage: string) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
    toast.success(successMessage);
  };

  const toggleDepartment = async (targetUser: User, department: string) => {
    const nextDepartments = targetUser.departments.includes(department)
      ? targetUser.departments.filter((item) => item !== department)
      : [...targetUser.departments, department];

    try {
      const updated = await api.updateDepartments(targetUser.id, nextDepartments);
      applyUpdatedUser(updated, "Departments updated");
    } catch {
      toast.error("Failed to update departments");
    }
  };

  const toggleRole = async (targetUser: User, roleId: string) => {
    const hasRole = targetUser.customRoles.some((role) => role.id === roleId);
    const nextRoleIds = hasRole
      ? targetUser.customRoles.filter((role) => role.id !== roleId).map((role) => role.id)
      : [...targetUser.customRoles.map((role) => role.id), roleId];

    if (nextRoleIds.length === 0) {
      toast.error("A user must keep at least one custom role.");
      return;
    }

    try {
      const updated = await api.assignUserRoles(targetUser.id, nextRoleIds);
      applyUpdatedUser(updated, "Role assignments updated");
    } catch {
      toast.error("Failed to update role assignments");
    }
  };

  if (currentUser?.role !== "ADMIN") return null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign departments and custom app roles for SuperFreight users.
        </p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <UserManagementTile
            key={user.id}
            user={user}
            roles={roles}
            departments={DEPARTMENTS}
            expandedUserId={expandedUserId}
            onExpandedUserIdChange={setExpandedUserId}
            onToggleDepartment={(department) => void toggleDepartment(user, department)}
            onToggleRole={(roleId) => void toggleRole(user, roleId)}
          />
        ))}
      </div>
    </div>
  );
}
