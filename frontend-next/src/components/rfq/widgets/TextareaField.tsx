"use client";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDefinition } from "@/types/rfq";

interface Props { field: FieldDefinition; value: string; onChange: (value: string) => void; }
export function TextareaField({ field, value, onChange }: Props) {
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
