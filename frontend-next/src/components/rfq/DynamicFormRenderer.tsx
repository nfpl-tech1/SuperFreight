"use client";
import type { FieldDefinition, FormValues } from "@/types/rfq";
import { isFieldVisible } from "@/lib/validation";
import { DynamicField } from "./DynamicField";

interface Props {
  fields: FieldDefinition[];
  values: FormValues;
  errors: Record<string, string>;
  onChange: (key: string, value: string | string[]) => void;
}

export function DynamicFormRenderer({
  fields,
  values,
  errors,
  onChange,
}: Props) {
  const visibleFields = fields.filter((field) => isFieldVisible(field, values));
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 xl:grid-cols-2">
      {visibleFields.map((field) => (
        <div
          key={field.key}
          className={field.halfWidth ? undefined : "col-span-2"}
        >
          <DynamicField
            field={field}
            value={
              values[field.key] ?? (field.type === "multiselect" ? [] : "")
            }
            values={values}
            onChange={onChange}
            error={errors[field.key]}
          />
        </div>
      ))}
    </div>
  );
}
