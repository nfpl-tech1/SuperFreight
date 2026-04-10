"use client";
import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types/rfq";

interface Props { field: FieldDefinition; value: string; onChange: (value: string) => void; }
export function NumberField({ field, value, onChange }: Props) {
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
