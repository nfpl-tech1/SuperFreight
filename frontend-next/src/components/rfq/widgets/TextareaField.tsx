"use client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldDefinition } from "@/types/rfq";

interface Props {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  unitValue?: string;
  onUnitChange?: (value: string) => void;
}

export function TextareaField({
  field,
  value,
  onChange,
  unitValue,
  onUnitChange,
}: Props) {
  if (field.unitOptions?.length && unitValue !== undefined && onUnitChange) {
    return (
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_9rem] lg:items-start">
        <Textarea
          id={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.ui?.placeholder ?? ""}
          rows={3}
        />
        <Select value={unitValue} onValueChange={onUnitChange}>
          <SelectTrigger>
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {field.unitOptions.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Textarea
      id={field.key}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.ui?.placeholder ?? ""}
      rows={2}
    />
  );
}
