import type { FieldDefinition } from "@/types/rfq";

export function validateFieldRules(field: FieldDefinition, value: string | string[]): string | null {
    const rules = field.rules;
    if (!rules) return null;

    if (field.type === "number" || field.type === "currency") {
        const numericValue = parseFloat(String(value));
        if (!isNaN(numericValue)) {
            if (rules.min !== undefined && numericValue < rules.min) {
                return `${field.label} must be >= ${rules.min}.`;
            }
            if (rules.max !== undefined && numericValue > rules.max) {
                return `${field.label} must be <= ${rules.max}.`;
            }
        }
    }

    if (rules.pattern && typeof value === "string") {
        const regex = new RegExp(`^${rules.pattern}$`);
        if (!regex.test(value)) {
            return `${field.label} format is invalid.`;
        }
    }

    return null;
}
