"use client";

import { Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RoleDetailsCardProps = {
  name: string;
  description: string;
  externalRoleId: string;
  duplicateNameExists: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function RoleDetailsCard({
  name,
  description,
  externalRoleId,
  duplicateNameExists,
  onNameChange,
  onDescriptionChange,
}: RoleDetailsCardProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-primary" />
        <div className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Briefcase className="h-5 w-5" />
          Role Details
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Example: Pricing Executive"
              className="h-12"
            />
            {duplicateNameExists && (
              <p className="text-sm text-red-600">A role with this name already exists.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-type">External ID</Label>
            <Input
              id="role-type"
              value={externalRoleId}
              readOnly
              className="h-12 bg-slate-50 text-slate-500"
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="role-description">Description</Label>
          <Textarea
            id="role-description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Explain which kind of team member should get this role."
            className="min-h-28"
          />
        </div>
      </div>
    </section>
  );
}
