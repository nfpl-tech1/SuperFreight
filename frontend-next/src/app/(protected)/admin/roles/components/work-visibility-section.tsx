"use client";

import { Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditableScopeRule } from "../role-builder.types";
import { SCOPE_TYPE_OPTIONS, SCOPE_VALUE_OPTIONS } from "../role-builder.constants";

type WorkVisibilitySectionProps = {
  scopeRules: EditableScopeRule[];
  onAddRule: () => void;
  onUpdateScopeType: (index: number, scopeType: string) => void;
  onUpdateScopeValue: (index: number, scopeValue: string) => void;
  onRemoveScopeRule: (index: number) => void;
};

export function WorkVisibilitySection({
  scopeRules,
  onAddRule,
  onUpdateScopeType,
  onUpdateScopeValue,
  onRemoveScopeRule,
}: WorkVisibilitySectionProps) {
  return (
    <section className="space-y-4 pb-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-primary" />
          <div className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Eye className="h-5 w-5" />
            Work Visibility Rules
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onAddRule}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-3">
        {scopeRules.map((rule, index) => {
          const valueOptions = SCOPE_VALUE_OPTIONS[rule.scopeType] ?? [];
          const selectedValue = valueOptions.find((option) => option.value === rule.scopeValue);

          return (
            <div key={`${rule.scopeType}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-4 xl:grid-cols-[220px_240px_minmax(0,1fr)_40px] xl:items-end">
                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select value={rule.scopeType} onValueChange={(value) => onUpdateScopeType(index, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Setting</Label>
                  <Select value={rule.scopeValue} onValueChange={(value) => onUpdateScopeValue(index, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {valueOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {selectedValue?.help}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveScopeRule(index)}
                  disabled={scopeRules.length === 1}
                  className="text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
