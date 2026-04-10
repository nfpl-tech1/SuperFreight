import type { FieldDefinition } from "@/types/rfq";

export function validateFieldType(field: FieldDefinition, value: string | string[]): string | null {
    if (field.type === "number" || field.type === "currency") {
        if (isNaN(parseFloat(String(value)))) {
            return `${field.label} must be numeric.`;
        }
    }
    if (field.type === "date") {
        if (typeof value === "string" && value.trim() !== "") {
            const parsed = new Date(value);
            if (isNaN(parsed.getTime())) {
                return `${field.label} must be a valid date.`;
            }
        }
    }
    if ((field.type === "select" || field.type === "radio") && field.options?.length) {
        if (!field.options.includes(String(value))) {
            return `${field.label} must be one of the allowed options.`;
        }
    }
    if (field.type === "multiselect") {
        if (!Array.isArray(value)) {
            return `${field.label} must be a list of selected values.`;
        }
        if (field.options?.length && value.some((item) => !field.options!.includes(item))) {
            return `${field.label} includes invalid options.`;
        }
    }
    return null;
}
