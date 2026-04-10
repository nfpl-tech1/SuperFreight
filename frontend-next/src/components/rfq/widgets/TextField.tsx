"use client";
import { Input } from "@/components/ui/input";
import type { FieldDefinition } from "@/types/rfq";

interface Props { field: FieldDefinition; value: string; onChange: (value: string) => void; }
export function TextField({ field, value, onChange }: Props) {
    return <Input id={field.key} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.ui?.placeholder ?? ""} />;
}
