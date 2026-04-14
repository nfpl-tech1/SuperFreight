"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
  max?: number;
  unitOptions: string[];
  unitValue: string;
  onUnitChange: (value: string) => void;
}

export function InputWithUnit({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  unitOptions,
  unitValue,
  onUnitChange,
}: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? ""}
        min={min}
        max={max}
      />
      <Select value={unitValue} onValueChange={onUnitChange}>
        <SelectTrigger>
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          {unitOptions.map((unit) => (
            <SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
