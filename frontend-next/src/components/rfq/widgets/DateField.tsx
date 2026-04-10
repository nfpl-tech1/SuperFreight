"use client";
import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types/rfq";

interface Props { field: FieldDefinition; value: string; onChange: (value: string) => void; }
export function DateField({ field, value, onChange }: Props) {
    return <Input id={field.key} type="date" value={value} onChange={(e) => onChange(e.target.value)} />;
}
