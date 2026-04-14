"use client";
import { Label } from "@/components/ui/label";
import type { FieldDefinition } from "@/types/rfq";
import { FieldError } from "./FieldError";
import { TextField } from "./widgets/TextField";
import { NumberField } from "./widgets/NumberField";
import { DateField } from "./widgets/DateField";
import { SelectField } from "./widgets/SelectField";
import { RadioField } from "./widgets/RadioField";
import { TextareaField } from "./widgets/TextareaField";
import { MultiselectField } from "./widgets/MultiselectField";

interface Props {
  field: FieldDefinition;
  value: string | string[];
  values: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
  error?: string;
}

export function DynamicField({ field, value, values, onChange, error }: Props) {
  const handleChange = (val: string | string[]) => onChange(field.key, val);
  const unitKey = field.unitOptions?.length ? `${field.key}_unit` : null;
  const unitValue =
    unitKey && typeof values[unitKey] === "string"
      ? values[unitKey]
      : (field.defaultUnit ?? field.unitOptions?.[0] ?? "");
  const handleUnitChange = unitKey
    ? (nextValue: string) => onChange(unitKey, nextValue)
    : undefined;

  const renderWidget = () => {
    switch (field.type) {
      case "text":
        return (
          <TextField
            field={field}
            value={value as string}
            onChange={handleChange}
            unitValue={unitKey ? unitValue : undefined}
            onUnitChange={handleUnitChange}
          />
        );
      case "number":
      case "currency":
        return (
          <NumberField
            field={field}
            value={value as string}
            onChange={handleChange}
            unitValue={unitKey ? unitValue : undefined}
            onUnitChange={handleUnitChange}
          />
        );
      case "date":
        return (
          <DateField
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        );
      case "select":
        return (
          <SelectField
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        );
      case "radio":
        return (
          <RadioField
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        );
      case "multiline":
        return (
          <TextareaField
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        );
      case "multiselect":
        return (
          <MultiselectField
            field={field}
            value={value as string[]}
            onChange={handleChange}
          />
        );
      default:
        return (
          <TextField
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        );
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 ${error ? "[&_input]:border-destructive [&_textarea]:border-destructive [&_button[role='combobox']]:border-destructive" : ""}`}
    >
      <Label
        htmlFor={field.key}
        className="text-[0.8125rem] font-medium text-[hsl(215_20%_40%)]"
      >
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {renderWidget()}
      {field.ui?.helpText && (
        <p className="text-xs text-muted-foreground">{field.ui.helpText}</p>
      )}
      {error && <FieldError message={error} />}
    </div>
  );
}
