"use client";
import type { FieldDefinition } from "@/types/rfq";

interface Props { field: FieldDefinition; value: string; onChange: (value: string) => void; }
export function RadioField({ field, value, onChange }: Props) {
    return (
        <div className="flex gap-4 items-center pt-1">
            {field.options?.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-[0.8125rem] cursor-pointer">
                    <input
                        type="radio"
                        name={field.key}
                        value={option}
                        checked={value === option}
                        onChange={() => onChange(option)}
                        className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-[hsl(215_20%_30%)]">{option}</span>
                </label>
            ))}
        </div>
    );
}
