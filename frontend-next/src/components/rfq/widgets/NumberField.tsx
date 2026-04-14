"use client";
import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types/rfq";
import { InputWithUnit } from "./InputWithUnit";

interface Props {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  unitValue?: string;
  onUnitChange?: (value: string) => void;
}

export function NumberField({
  field,
  value,
  onChange,
  unitValue,
  onUnitChange,
}: Props) {
  if (field.unitOptions?.length && unitValue !== undefined && onUnitChange) {
    return (
      <InputWithUnit
        id={field.key}
        type="number"
        value={value}
        onChange={onChange}
        placeholder={field.ui?.placeholder}
        min={field.rules?.min}
        max={field.rules?.max}
        unitOptions={field.unitOptions}
        unitValue={unitValue}
        onUnitChange={onUnitChange}
      />
    );
  }

  return (
    <Input
      id={field.key}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.ui?.placeholder ?? ""}
      min={field.rules?.min}
      max={field.rules?.max}
    />
  );
}
