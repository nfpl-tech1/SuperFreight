"use client";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldDefinition } from "@/types/rfq";

interface Props { field: FieldDefinition; value: string[]; onChange: (value: string[]) => void; }
export function MultiselectField({ field, value, onChange }: Props) {
    const toggle = (option: string) => {
        const next = value.includes(option)
            ? value.filter((v) => v !== option)
            : [...value, option];
        onChange(next);
    };
    return (
        <div className="flex flex-wrap gap-2.5 pt-1">
            {field.options?.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-[0.8125rem] cursor-pointer">
                    <Checkbox checked={value.includes(option)} onCheckedChange={() => toggle(option)} />
                    <span className="text-[hsl(215_20%_30%)]">{option}</span>
                </label>
            ))}
        </div>
    );
}
