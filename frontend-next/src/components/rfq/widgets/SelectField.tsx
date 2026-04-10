"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FieldDefinition } from "@/types/rfq";

interface Props { field: FieldDefinition; value: string; onChange: (value: string) => void; }
export function SelectField({ field, value, onChange }: Props) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger id={field.key} className="w-full">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
                {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
